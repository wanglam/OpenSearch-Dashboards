/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import type { EuiToolTipProps } from '@elastic/eui';

import { DismissibleTooltip } from './dismissible_tooltip';

// Mock EuiToolTip to capture the className prop
jest.mock('@elastic/eui', () => ({
  ...jest.requireActual('@elastic/eui'),
  EuiToolTip: ({ children, className }: EuiToolTipProps) => (
    <span className={`euiToolTipAnchor ${className || ''}`.trim()} data-testid="mocked-tooltip">
      {children}
    </span>
  ),
}));

describe('DismissibleTooltip', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders child element correctly', () => {
    render(
      <DismissibleTooltip content="Test tooltip">
        <button onClick={mockOnClick}>Test Button</button>
      </DismissibleTooltip>
    );

    expect(screen.getByRole('button', { name: 'Test Button' })).toBeInTheDocument();
  });

  it('calls original onClick handler when child is clicked', () => {
    render(
      <DismissibleTooltip content="Test tooltip">
        <button onClick={mockOnClick}>Test Button</button>
      </DismissibleTooltip>
    );

    const button = screen.getByRole('button', { name: 'Test Button' });
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockOnClick).toHaveBeenCalledWith(expect.any(Object));
  });

  it('works with child elements that do not have onClick', () => {
    render(
      <DismissibleTooltip content="Test tooltip">
        <div>Test Div</div>
      </DismissibleTooltip>
    );

    const div = screen.getByText('Test Div');

    // Should not throw error when clicking
    expect(() => fireEvent.click(div)).not.toThrow();
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener');

    const { unmount } = render(
      <DismissibleTooltip content="Test tooltip">
        <button onClick={mockOnClick}>Test Button</button>
      </DismissibleTooltip>
    );

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('handles multiple clicks without errors', () => {
    render(
      <DismissibleTooltip content="Test tooltip">
        <button onClick={mockOnClick}>Test Button</button>
      </DismissibleTooltip>
    );

    const button = screen.getByRole('button', { name: 'Test Button' });

    // Multiple clicks should not cause errors
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockOnClick).toHaveBeenCalledTimes(3);
  });

  it('applies dismissible-tooltip-hide class when clicked and removes it on outside click', () => {
    const { container } = render(
      <DismissibleTooltip content="Test tooltip">
        <button onClick={mockOnClick}>Test Button</button>
      </DismissibleTooltip>
    );

    const button = screen.getByRole('button', { name: 'Test Button' });
    const tooltipElement = container.querySelector('.euiToolTipAnchor');

    // Initially, tooltip should not have the hide class
    expect(tooltipElement).not.toHaveClass('dismissible-tooltip-hide');

    // Click the button to dismiss the tooltip
    fireEvent.click(button);

    // After clicking, tooltip should have the hide class
    expect(tooltipElement).toHaveClass('dismissible-tooltip-hide');

    // Click outside to restore tooltip
    fireEvent.click(document.body);

    // The hide class should be removed
    expect(tooltipElement).not.toHaveClass('dismissible-tooltip-hide');

    // Verify original onClick was called
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
