import React from 'react';
import { QrGeneratorTool } from './analyze/QrGeneratorTool';
import { WebpConverterTool } from './image/WebpConverterTool';
import { ByteCounterTool } from './plan/ByteCounterTool';
import { LoremGeneratorTool } from './plan/LoremGeneratorTool';
import { InstaSpacerTool } from './publish/InstaSpacerTool';
import { HashtagMixerTool } from './publish/HashtagMixerTool';
import { TextCounterTool } from './text/TextCounterTool';

// Import tool components
export { TextCounterTool } from './text/TextCounterTool';
export { LoremGeneratorTool } from './plan/LoremGeneratorTool';
export { ByteCounterTool } from './plan/ByteCounterTool';
export { WebpConverterTool } from './image/WebpConverterTool';
export { InstaSpacerTool } from './publish/InstaSpacerTool';
export { HashtagMixerTool } from './publish/HashtagMixerTool';
export { QrGeneratorTool } from './analyze/QrGeneratorTool';

// Component mapping
export const toolComponentMap: Record<string, React.ComponentType<unknown>> = {
  'text-counter': TextCounterTool,
  'lorem-generator': LoremGeneratorTool,
  'byte-counter': ByteCounterTool,
  'webp-converter': WebpConverterTool,
  'insta-spacer': InstaSpacerTool,
  'hashtag-mixer': HashtagMixerTool,
  'qr-generator': QrGeneratorTool,
};
