import React from 'react';

// Import tool components
export { TextCounterTool } from './text/TextCounterTool';
export { WebpConverterTool } from './image/WebpConverterTool';
export { QrGeneratorTool } from './analyze/QrGeneratorTool';

// Component mapping
export const toolComponentMap: Record<string, React.ComponentType<any>> = {
  'text-counter': require('./text/TextCounterTool').TextCounterTool,
  'webp-converter': require('./image/WebpConverterTool').WebpConverterTool,
  'qr-generator': require('./analyze/QrGeneratorTool').QrGeneratorTool,
};
