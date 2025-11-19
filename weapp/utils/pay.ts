import { payOrder, getPayStatus } from "@/api/order";
import { useProduceStore } from "@/store";
import type { OrderPayReq } from "@/types/order";

interface PayOptions {
  onSuccess?: (orderSn: string) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
}

class PayManager {
  private pollingTimer: number | null = null;
  private options: PayOptions = {};

  // 清理定时器
  private clearPayPolling() {
    if (this.pollingTimer) {
      clearTimeout(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  private subscribeMessage() {
    wx.requestSubscribeMessage({
      tmplIds: [
        "3d70XzvvtYZt4LaF7Wc7UPhWCrod3eHvJZvqcF1Ziqc", // 订单制作完成提醒
        "bN8HMOHMBUEdpCRDgnGD0SJ0fWERFt9EmoXo1D4WEQI", // 商品制作完成通知
        "gMcTsr2rrB9UEp2pmUngpKNK7aJGJY-wwYO1rrIK0N0", // 订单状态异常通知
      ],
      success: (res) => {
        console.log("subscribeMessage: ", res);
      },
      fail: (err) => {
        console.log("subscribeMessage fail: ", err);
      },
    });
  }

  // 处理支付成功
  private handlePaySuccess(orderSn: string) {
    this.clearPayPolling();
    this.subscribeMessage();
    this.options.onSuccess?.(orderSn);
    // 重置生产状态
    setTimeout(() => {
      useProduceStore().resetAll();
    }, 1500);
  }

  // 开始轮询支付状态
  private startPayStatusPolling(orderSn: string) {
    this.clearPayPolling();

    const startTime = Date.now();
    const TIMEOUT_DURATION = 5 * 60 * 1000; // 5分钟
    const POLL_INTERVAL = 2000; // 2秒

    const pollStatus = async () => {
      try {
        if (Date.now() - startTime > TIMEOUT_DURATION) {
          this.clearPayPolling();
          wx.hideLoading();
          const errorMsg = "支付超时，请重新尝试";
          wx.showToast({
            title: errorMsg,
            icon: "error",
          });
          this.options.onError?.(errorMsg);
          return;
        }

        const res = await getPayStatus(orderSn);
        const payStatus = res?.data?.payStatus;
        console.log(
          "Payment status:",
          payStatus,
          "Time elapsed:",
          Math.floor((Date.now() - startTime) / 1000),
          "s"
        );

        if (payStatus === 2) {
          wx.hideLoading();
          wx.showToast({
            title: "支付成功",
            icon: "none",
          });
          this.handlePaySuccess(orderSn);
        } else if (payStatus === 3 || payStatus === -1) {
          this.clearPayPolling();
          wx.hideLoading();
          const errorMsg = "支付失败，请重新尝试";
          wx.showToast({
            title: errorMsg,
            icon: "error",
          });
          this.options.onError?.(errorMsg);
        } else {
          // 继续轮询
          this.pollingTimer = setTimeout(pollStatus, POLL_INTERVAL) as any;
        }
      } catch (error) {
        console.error("Payment status query failed:", error);
        // 继续轮询，除非超时
        if (Date.now() - startTime < TIMEOUT_DURATION) {
          this.pollingTimer = setTimeout(pollStatus, POLL_INTERVAL) as any;
        }
      }
    };

    pollStatus();
  }

  // 处理微信小程序支付
  private handleWechatMiniPayment(payData: string, orderSn: string) {
    try {
      const payParams = JSON.parse(payData);

      const wechatPayParams = {
        timeStamp: String(
          payParams.params.timeStamp || payParams.config.timestamp
        ),
        nonceStr: String(
          payParams.params.nonceStr || payParams.config.nonce_str
        ),
        package: String(payParams.params.package),
        paySign: String(payParams.params.paySign),
        signType: payParams.params.signType,
      };

      wx.requestPayment({
        ...wechatPayParams,
        success: () => {
          wx.showToast({
            title: "支付成功",
            icon: "none",
          });
          this.handlePaySuccess(orderSn);
        },
        fail: (err: any) => {
          this.clearPayPolling();
          if (err.errMsg === "requestPayment:fail cancel") {
            this.options.onCancel?.();
          } else {
            const errorMsg = `支付失败: ${err.errMsg}`;
            this.options.onError?.(errorMsg);
            wx.showToast({
              title: errorMsg,
              icon: "error",
            });
          }
        },
      });
    } catch (error) {
      console.error("WeChat payment error:", error);
      this.clearPayPolling();
      const errorMsg = "支付参数错误";
      this.options.onError?.(errorMsg);
      wx.showToast({
        title: errorMsg,
        icon: "error",
      });
    }
  }

  // 显示微信支付确认弹窗
  private showWechatPayModal(orderInfo: {
    orderSn: string;
    payData: string;
    payAmount: number;
  }) {
    wx.showModal({
      title: "确认支付",
      content: `订单号: ${orderInfo.orderSn}\n支付金额: ¥${orderInfo.payAmount}`,
      confirmText: "确认",
      cancelText: "取消",
      success: (res) => {
        if (res.confirm) {
          this.handleWechatMiniPayment(orderInfo.payData, orderInfo.orderSn);
        } else {
          this.clearPayPolling();
          this.options.onCancel?.();
        }
      },
    });
  }

  // 主要支付方法
  async pay(orderSn: string, options: PayOptions = {}) {
    this.options = options;

    wx.showLoading({ title: "正在处理订单..." });

    try {
      // 小程序环境，使用 mini 类型
      const orderPayReq: OrderPayReq = {
        orderSn,
        payType: "wxpay",
        tradeType: "mini",
      };

      console.log("Order payment request:", orderPayReq);
      const res = await payOrder(orderPayReq);

      wx.hideLoading();

      const data = res?.data;
      const payOrderSn = data?.orderSn;
      const payData = data?.payData;
      const payAmount = data?.payAmount;

      if (payOrderSn && payData && payAmount != null && payAmount > 0) {
        // 显示支付确认弹窗
        this.showWechatPayModal({
          orderSn: payOrderSn,
          payData,
          payAmount,
        });
        // 开始轮询支付状态
        this.startPayStatusPolling(payOrderSn);
      } else {
        const errorMsg = "支付数据获取失败，请稍后重试";
        wx.showToast({
          title: res?.message || errorMsg,
          icon: "none",
          duration: 2000,
        });
        this.options.onError?.(errorMsg);
      }
    } catch (error) {
      wx.hideLoading();
      console.error("Payment failed:", error);
      const errorMsg = "支付失败，请稍后重试";
      wx.showToast({
        title: errorMsg,
        icon: "error",
      });
      this.options.onError?.(errorMsg);
    }
  }

  // 清理资源
  destroy() {
    this.clearPayPolling();
    this.options = {};
  }
}

// 导出单例
export const payManager = new PayManager();

// 导出便捷方法
export function usePay(options: PayOptions = {}) {
  return {
    payOrder: (orderSn: string) => payManager.pay(orderSn, options),
    clearPayPolling: () => payManager.destroy(),
  };
}
