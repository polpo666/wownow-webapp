import { TemplateLabel } from '../types/template';

interface TemplateConfig {
  label: TemplateLabel;
  width: number;
  height: number;
  placeholderUrl: string; 
}

// Chat Image Generation Configs
export const templateConfigs: TemplateConfig[] = [
  {
    label: TemplateLabel.FlatCoin,
    width: 450,
    height: 450,
    placeholderUrl:
      'https://wownow-dev-storage.oss-cn-shenzhen.aliyuncs.com/wownow/presets/0001.png',
  },
  {
    label: TemplateLabel.ReliefCoin,
    width: 446,
    height: 446,
    placeholderUrl:
      'https://wownow-dev-storage.oss-cn-shenzhen.aliyuncs.com/wownow/presets/0002.png',
  },
  {
    label: TemplateLabel.UVCoin,
    width: 446,
    height: 446,
    placeholderUrl:
      'https://wownow-dev-storage.oss-cn-shenzhen.aliyuncs.com/wownow/presets/0003.png',
  },
  {
    label: TemplateLabel.FlatCard,
    width: 530,
    height: 846,
    placeholderUrl:
      'https://wownow-dev-storage.oss-cn-shenzhen.aliyuncs.com/wownow/presets/00040006.png',
  },
  {
    label: TemplateLabel.ReliefCard,
    width: 510,
    height: 826,
    placeholderUrl:
      'https://wownow-dev-storage.oss-cn-shenzhen.aliyuncs.com/wownow/presets/00050007.png',
  },
  {
    label: TemplateLabel.NormalCard,
    width: 540,
    height: 856,
    placeholderUrl:
      'https://wownow-dev-storage.oss-cn-shenzhen.aliyuncs.com/wownow/presets/00100011.png',
  },
  {
    label: TemplateLabel.RedEnvelopeCard,
    width: 540,
    height: 856,
    placeholderUrl:
      'https://wownow-dev-storage.oss-cn-shenzhen.aliyuncs.com/wownow/presets/00100011.png',
  },
  {
    label: TemplateLabel.FlatSquareCard,
    width: 490,
    height: 490,
    placeholderUrl: 'https://wownow-dev-storage.oss-cn-shenzhen.aliyuncs.com/wownow/presets/0008.png',
  },
  {
    label: TemplateLabel.ReliefSquareCard,
    width: 470,
    height: 470,
    placeholderUrl: 'https://wownow-dev-storage.oss-cn-shenzhen.aliyuncs.com/wownow/presets/0009.png',
  },
  {
    label: TemplateLabel.LuxuryFlatSquareCard,
    width: 320,
    height: 320,
    placeholderUrl: 'https://wownow-dev-storage.oss-cn-shenzhen.aliyuncs.com/wownow/presets/0001.png',
  },
  {
    label: TemplateLabel.LuxuryReliefSquareCard,
    width: 320,
    height: 320,
    placeholderUrl: 'https://wownow-dev-storage.oss-cn-shenzhen.aliyuncs.com/wownow/presets/0001.png',
  },
];

export const flatPromptStyles = [
  { styleId: 1330, styleName: '矢量线条风格' },
  { styleId: 1338, styleName: '复古美漫' },
];
