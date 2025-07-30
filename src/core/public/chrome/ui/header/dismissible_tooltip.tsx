/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, cloneElement, useRef, useEffect } from 'react';
import { EuiToolTip, EuiToolTipProps } from '@elastic/eui';
import classNames from 'classnames';

import './dismissible_tooltip.scss';

interface DismissibleTooltipProps extends Partial<EuiToolTipProps> {
  children: EuiToolTipProps['children'];
}

export const DismissibleTooltip: React.FC<DismissibleTooltipProps> = (props) => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(true);
  const isClickFromChildRef = useRef(false);

  const handleChildClick = (event: React.MouseEvent) => {
    setIsTooltipVisible((prevVisible) => !prevVisible);
    isClickFromChildRef.current = true;

    // Call the original onClick handler if it exists
    const originalOnClick = React.isValidElement(props.children)
      ? props.children.props.onClick
      : undefined;
    if (originalOnClick) {
      originalOnClick(event);
    }
  };

  useEffect(() => {
    const handleOutsideClick = () => {
      if (isClickFromChildRef.current) {
        isClickFromChildRef.current = false;
        return;
      }
      setIsTooltipVisible(true);
    };

    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  return (
    <EuiToolTip
      className={classNames({
        'dismissible-tooltip-hide': !isTooltipVisible,
      })}
      {...props}
    >
      {cloneElement(props.children, {
        onClick: handleChildClick,
      })}
    </EuiToolTip>
  );
};
