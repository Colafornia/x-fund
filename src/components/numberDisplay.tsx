import React from 'react';

export default function NumberDisplay(props: any) {
  const isNegative = String(props.value).startsWith('-');
  const displayValue = isNegative ? props.value : `+${props.value}`;
  return (
  <span style={{ color: isNegative ? '#3f8600' : '#cf1322' }}>{displayValue}</span>
  )
};
