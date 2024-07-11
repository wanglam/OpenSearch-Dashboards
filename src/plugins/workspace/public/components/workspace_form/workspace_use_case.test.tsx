/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { WorkspaceUseCase, WorkspaceUseCaseProps } from './workspace_use_case';
import { WORKSPACE_USE_CASES } from 'src/plugins/workspace/common/constants';

const setup = (options?: Partial<WorkspaceUseCaseProps>) => {
  const onChangeMock = jest.fn();
  const renderResult = render(
    <WorkspaceUseCase
      availableUseCases={[
        WORKSPACE_USE_CASES.observability,
        WORKSPACE_USE_CASES['security-analytics'],
        WORKSPACE_USE_CASES.analytics,
        WORKSPACE_USE_CASES.search,
        {
          id: 'system-use-case',
          title: 'System use case',
          description: 'System use case description',
          features: [],
          systematic: true,
        },
      ]}
      value={[]}
      onChange={onChangeMock}
      {...options}
    />
  );
  return {
    renderResult,
    onChangeMock,
  };
};

describe('WorkspaceUseCase', () => {
  it('should render four use cases', () => {
    const { renderResult } = setup();

    expect(renderResult.getByText('Observability')).toBeInTheDocument();
    expect(renderResult.getByText('Analytics')).toBeInTheDocument();
    expect(renderResult.getByText('Security Analytics')).toBeInTheDocument();
    expect(renderResult.getByText('Search')).toBeInTheDocument();
  });

  it('should call onChange with new added use case', () => {
    const { renderResult, onChangeMock } = setup();

    expect(onChangeMock).not.toHaveBeenCalled();
    fireEvent.click(renderResult.getByText('Observability'));
    expect(onChangeMock).toHaveBeenLastCalledWith(['observability']);
  });

  it('should call onChange without removed use case', () => {
    const { renderResult, onChangeMock } = setup({ value: ['observability'] });

    expect(onChangeMock).not.toHaveBeenCalled();
    fireEvent.click(renderResult.getByText('Observability'));
    expect(onChangeMock).toHaveBeenLastCalledWith([]);
  });
});
