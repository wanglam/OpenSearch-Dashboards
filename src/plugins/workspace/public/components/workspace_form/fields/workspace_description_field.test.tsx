/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

import { MAX_WORKSPACE_DESCRIPTION_LENGTH } from '../../../../common/constants';
import { WorkspaceDescriptionField } from './workspace_description_field';

describe('<WorkspaceDescriptionField />', () => {
  it('should call onChange when the new value is within MAX_WORKSPACE_DESCRIPTION_LENGTH', () => {
    const onChangeMock = jest.fn();
    const value = 'test';

    render(<WorkspaceDescriptionField value={value} onChange={onChangeMock} />);

    const textarea = screen.getByPlaceholderText('Describe the workspace');
    fireEvent.change(textarea, { target: { value: 'new value' } });

    expect(onChangeMock).toHaveBeenCalledWith('new value');
  });

  it('should not call onChange when the new value exceeds MAX_WORKSPACE_DESCRIPTION_LENGTH', () => {
    const onChangeMock = jest.fn();
    const value = 'a'.repeat(MAX_WORKSPACE_DESCRIPTION_LENGTH);

    render(<WorkspaceDescriptionField value={value} onChange={onChangeMock} />);

    const textarea = screen.getByPlaceholderText('Describe the workspace');
    fireEvent.change(textarea, {
      target: { value: 'a'.repeat(MAX_WORKSPACE_DESCRIPTION_LENGTH + 1) },
    });

    expect(onChangeMock).not.toHaveBeenCalled();
  });

  it('should render the correct number of characters left when value is empty', () => {
    render(<WorkspaceDescriptionField value={undefined} onChange={jest.fn()} />);

    const helpText = screen.getByText(
      new RegExp(`${MAX_WORKSPACE_DESCRIPTION_LENGTH}.+characters left\.`)
    );
    expect(helpText).toBeInTheDocument();
  });
});
