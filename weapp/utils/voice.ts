/**
 * 检查触摸点是否在区域内
 * @param touchX
 * @param touchY
 * @param areaRect
 */
export const isPointInArea = (
  touchX: number,
  touchY: number,
  areaRect: any
) => {
  if (!areaRect) return false;

  return (
    touchX >= areaRect.left &&
    touchX <= areaRect.right &&
    touchY >= areaRect.top &&
    touchY <= areaRect.bottom
  );
};
/**
 * 获取错误信息
 * @param retcode
 * @returns
 */
export const getErrorMessage = (retcode: number): string => {
  const errorMessages: { [key: number]: string } = {
    [-30001]: "录音接口出错，请检查麦克风权限",
    [-30002]: "录音被暂停，请重新开始",
    [-30003]: "录音数据传输失败，请检查网络",
    [-30004]: "未识别到语音，请重新说话",
    [-30005]: "语音识别服务内部错误",
    [-30006]: "识别超时，请重试",
    [-30007]: "录音参数错误",
    [-30008]: "网络请求失败",
    [-30009]: "鉴权失败",
    [-30010]: "网络鉴权失败",
    [-30011]: "录音已在进行中",
    [-30012]: "当前无录音任务",
    [-30013]: "未知错误",
    [-40001]: "调用频率过高，请稍后再试",
  };

  return errorMessages[retcode] || `录音失败 (错误码: ${retcode})`;
};

/**
 * 判断是否可以重试
 * @param retcode
 * @returns
 */
export const canRetry = (retcode: number): boolean => {
  const retryableErrors: number[] = [
    // -30003, // 录音数据传输失败
    // -30004, // 网络异常
    // -30005, // 语音识别服务内部错误
    // -30006, // 识别超时
    // -30008, // 网络请求失败
    // -30010, // 网络鉴权失败
    // -30013, // 未知错误
  ];

  return retryableErrors.includes(retcode);
};


/**
 * 检查并请求录音权限
 */
export const checkRecordPermission = async (): Promise<boolean> => {
  return new Promise((resolve) => {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.record'] === false) {
          // 用户已拒绝授权，引导去设置页面
          wx.showModal({
            title: '需要麦克风权限',
            content: '请在设置中开启麦克风权限，以使用语音输入功能',
            confirmText: '去设置',
            cancelText: '取消',
            success: (modalRes) => {
              if (modalRes.confirm) {
                wx.openSetting({
                });
              }
            }
          });
          resolve(false);
        } else if (res.authSetting['scope.record'] === undefined) {
          // 从未请求过权限，发起授权请求
          wx.authorize({
            scope: 'scope.record',
            success: () => {
              wx.showToast({
                title: '授权成功，请再次点击开始录音',
                icon: 'success',
                duration: 2000
              });
            },
            fail: () => {
              wx.showToast({
                title: '需要麦克风权限才能使用语音输入',
                icon: 'none',
                duration: 2000
              });
            }
          });
          resolve(false);
        } else {
          // 已授权
          resolve(true);
        }
      },
      fail: () => {
        wx.showToast({
          title: '获取权限状态失败',
          icon: 'none',
          duration: 2000
        });
        resolve(false);
      }
    });
  });
}
