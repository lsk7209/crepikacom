import React from 'react';

// Import tool components
export { TextCounterTool } from './text/TextCounterTool';
export { LoremGeneratorTool } from './plan/LoremGeneratorTool';
export { ByteCounterTool } from './plan/ByteCounterTool';
export { WebpConverterTool } from './image/WebpConverterTool';
export { InstaSpacerTool } from './publish/InstaSpacerTool';
export { HashtagMixerTool } from './publish/HashtagMixerTool';
export { QrGeneratorTool } from './analyze/QrGeneratorTool';

// Component mapping
export const toolComponentMap: Record<string, React.ComponentType<any>> = {
  'text-counter': require('./text/TextCounterTool').TextCounterTool,
  'lorem-generator': require('./plan/LoremGeneratorTool').LoremGeneratorTool,
  'byte-counter': require('./plan/ByteCounterTool').ByteCounterTool,
  'webp-converter': require('./image/WebpConverterTool').WebpConverterTool,
  'insta-spacer': require('./publish/InstaSpacerTool').InstaSpacerTool,
  'hashtag-mixer': require('./publish/HashtagMixerTool').HashtagMixerTool,
  'qr-generator': require('./analyze/QrGeneratorTool').QrGeneratorTool,
};
