/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo } from 'react';
import html2canvas from 'html2canvas';
import { reject } from 'lodash';
import { useObservable } from 'react-use';
import { of } from 'rxjs';

import { useOpenSearchDashboards } from '../../../opensearch_dashboards_react/public';
import { CoreStart } from '../../../../core/public';

export const usePageContainerCapture = () => {
  const {
    services: {
      core: { chat },
    },
  } = useOpenSearchDashboards<{ core: CoreStart }>();
  const chatScreenshotObservable$ = useMemo(() => {
    if (chat?.getScreenshotFeatureEnabled$) {
      return chat.getScreenshotFeatureEnabled$();
    }
    return of(false);
  }, [chat]);
  const screenshotFeatureEnabled = useObservable(chatScreenshotObservable$, false);
  const [isCapturing, setIsCapturing] = useState(false);

  const capturePageContainer = useCallback(async () => {
    if (isCapturing) {
      return;
    }
    setIsCapturing(true);
    try {
      const screenshotPageContainerElement = chat.screenshotPageContainerElement;
      if (!screenshotPageContainerElement) {
        throw new Error('chat.screenshotPageContainerElement not set');
      }
      // Access child nodes to get the latest changes
      const element = screenshotPageContainerElement.childNodes[0];
      return await new Promise<{ base64: string; sizeInBytes: number; mimeType: string }>(
        (resolve) => {
          window.requestAnimationFrame(async () => {
            try {
              const mimeType = 'image/jpeg';
              const canvas = await html2canvas(element as HTMLElement, {
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
              });

              const base64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];

              // Calculate size in bytes (base64 encoding adds ~33% overhead)
              const sizeInBytes = Math.ceil((base64.length * 3) / 4);

              resolve({
                base64,
                sizeInBytes,
                mimeType,
              });
            } catch (err) {
              reject(err);
            }
          });
        }
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to capture screenshot:', error);
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [isCapturing, chat.screenshotPageContainerElement]);

  return {
    screenshotFeatureEnabled,
    isCapturing,
    capturePageContainer,
  };
};
