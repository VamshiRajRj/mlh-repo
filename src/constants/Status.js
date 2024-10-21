const OrderStatus = [
  {label: 'All', value: ''},
  {label: 'PLACED', value: 'PLACED'},
  {label: 'DELAYED', value: 'DELAYED'},
  {label: 'CANCELLEDBYADMIN', value: 'CANCELLEDBYADMIN'},
  {label: 'CONFIRMED', value: 'CONFIRMED'},
  {label: 'DISPATCHED', value: 'DISPATCHED'},
  {label: 'PARTIAL', value: 'PARTIAL'},
  {label: 'DELIVERED', value: 'DELIVERED'},
  {label: 'NOTCONFIRMED', value: 'NOTCONFIRMED'},
  {label: 'CANCELLEDBYCUSTOMER', value: 'CANCELLEDBYCUSTOMER'},
  {label: 'CANCELLEDBYSYSTEM', value: 'CANCELLEDBYSYSTEM'},
];

const PayStatus = [
  {label: 'All', value: ''},
  {label: 'CANCELLED', value: 'CANCELLED'},
  {label: 'PAID', value: 'PAID'},
  {label: 'PENDING', value: 'PENDING'},
  {label: 'CREATED', value: 'CREATED'},
  {label: 'EXPIRED', value: 'EXPIRED'},
];

export {OrderStatus, PayStatus};
