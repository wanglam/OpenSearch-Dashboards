/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EuiCard, EuiText, EuiTitle } from '@elastic/eui';
import { i18n } from '@osd/i18n';

const WorkspaceFaqItem = ({ question, answer }: { question: string; answer: string }) => {
  return (
    <EuiText size="xs">
      <h4>{question}</h4>
      <p>{answer}</p>
    </EuiText>
  );
};

const FAQs = [
  {
    question: 'Can I change the workspace use case later?',
    answer: 'Lorem ipsum dolor sit amet consecetur lorem ipsum dolor sit amet.',
  },
  {
    question: 'Are data sources workspace specific or global',
    answer: 'Lorem ipsum dolor sit amet consecetur lorem ipsum dolor sit amet.',
  },
  {
    question: 'Do workspaces permissions control access to data?',
    answer: 'Workspace permissions are about access to dashboards.',
  },
];

export const WorkspaceFaqPanel = () => {
  return (
    <EuiCard
      title={i18n.translate('workspace.form.rightSidebar.faq.title', {
        defaultMessage: 'FAQs',
      })}
      textAlign="left"
      titleSize="xs"
      titleElement="h3"
    >
      {FAQs.map(({ question, answer }, index) => (
        <WorkspaceFaqItem key={index} question={question} answer={answer} />
      ))}
    </EuiCard>
  );
};
