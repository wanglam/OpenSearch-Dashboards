/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useObservable } from 'react-use';
import { EuiButtonIcon, EuiTextColor, EuiTextArea, EuiToolTip } from '@elastic/eui';
import { i18n } from '@osd/i18n';
import { useChatContext } from '../contexts/chat_context';
import { ChatLayoutMode } from './chat_header_button';
import { ContextPills } from './context_pills';
import { SlashCommandMenu } from './slash_command_menu';
import { useCommandMenuKeyboard } from '../hooks/use_command_menu_keyboard';
import './chat_input.scss';

interface ChatInputProps {
  layoutMode: ChatLayoutMode;
  input: string;
  isDisabled: boolean;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  includeScreenShotEnabled: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  layoutMode,
  input,
  isDisabled,
  onInputChange,
  onSend,
  onKeyDown,
  includeScreenShotEnabled,
}) => {
  const { chatService } = useChatContext();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const shouldIncludeScreenshotAfterSend = useObservable(
    chatService.getShouldIncludeScreenshotAfterSend$(),
    false
  );

  // Use custom hook for command menu keyboard handling
  const {
    showCommandMenu,
    commandSuggestions,
    selectedCommandIndex,
    ghostText,
    handleKeyDown,
    handleCommandSelect,
  } = useCommandMenuKeyboard({
    input,
    onInputChange,
    onKeyDown,
    inputRef,
  });

  return (
    <div className={`chatInput chatInput--${layoutMode}`}>
      <ContextPills category="chat" />
      <div
        className={`chatInput__inputRow ${includeScreenShotEnabled ? 'treeColumn' : ''}`}
        style={{ position: 'relative' }}
      >
        {includeScreenShotEnabled &&
          (isDisabled ? (
            <EuiButtonIcon
              size="xs"
              iconType="image"
              color={shouldIncludeScreenshotAfterSend ? 'primary' : 'text'}
              disabled={isDisabled}
              style={{ cursor: 'not-allowed' }}
            />
          ) : (
            <EuiToolTip
              content={i18n.translate('chat.chatInput.screenshotTriggerTip', {
                defaultMessage:
                  'Include the current page contents for your questions. Best for getting answers for the viewing page.',
              })}
            >
              <EuiButtonIcon
                size="xs"
                iconType="image"
                color={shouldIncludeScreenshotAfterSend ? 'primary' : 'text'}
                onClick={() => {
                  chatService.setShouldIncludeScreenshotAfterSend(
                    !shouldIncludeScreenshotAfterSend
                  );
                }}
              />
            </EuiToolTip>
          ))}
        {showCommandMenu && (
          <SlashCommandMenu
            commands={commandSuggestions}
            selectedIndex={selectedCommandIndex}
            onSelect={handleCommandSelect}
          />
        )}
        <div className="chatInput__fieldWrapper">
          <EuiTextArea
            inputRef={inputRef}
            placeholder="Ask anything. Type / for actions"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isDisabled}
            autoFocus={true}
            fullWidth
            resize="none"
            rows={1}
          />
          {ghostText && (
            <div className="chatInput__ghostText" aria-hidden="true">
              {input}
              <EuiTextColor color="subdued" className="chatInput__ghostText--subdued">
                {ghostText}
              </EuiTextColor>
            </div>
          )}
        </div>
        <EuiButtonIcon
          iconType={isDisabled ? 'generate' : 'sortUp'}
          onClick={onSend}
          isDisabled={input.trim().length === 0 || isDisabled}
          aria-label="Send message"
          size="m"
          color="primary"
          display="fill"
        />
      </div>
    </div>
  );
};
