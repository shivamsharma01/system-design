// Office-only fixtures. Shared orders, catalogue, activity and storefront settings stay authoritative.
export function officeData(state) {
  if (!state.office) {
    const order = state.orders[0];
    const date = String(order?.date || new Date().toISOString()).slice(0, 10);
    state.office = {
      expenses: [
        { id: 'EX-101', title: 'Packing cartons', category: 'Direct', frequency: 'Daily', amount: 840, date, notes: 'Warehouse packing supplies' },
        { id: 'EX-102', title: 'Warehouse utilities', category: 'Indirect', frequency: 'Monthly', amount: 3200, date, notes: 'Bahadurgarh operating costs' }
      ],
      staff: [
        { id: 'ST-101', name: 'Neha Saini', email: 'neha@example.test', role: 'Admin' },
        { id: 'ST-102', name: 'Arun Malik', email: 'arun@example.test', role: 'Operations' },
        { id: 'ST-103', name: 'Riya Batra', email: 'riya@example.test', role: 'Support' },
        { id: 'ST-104', name: 'Dev Kumar', email: 'dev@example.test', role: 'Inventory' }
      ],
      tickets: order ? [{ id: 'SR-101', subject: 'Delivery status enquiry', order: order.id, priority: 'Normal', owner: 'ST-103', status: 'Open', notes: 'Customer requested an update on the delivery date.' }] : [],
      templates: [
        { id: 'TM-101', title: 'Verification code', channel: 'SMS', status: 'Draft', body: 'Your demo verification code is {{code}}. It is valid for five minutes.' },
        { id: 'TM-102', title: 'Order received', channel: 'WhatsApp', status: 'Draft', body: 'Order {{order}} has been received and awaits review by LGM.' },
        { id: 'TM-103', title: 'Shipment dispatched', channel: 'SMS', status: 'Draft', body: 'Your order {{order}} has been dispatched.' }
      ]
    };
  }
  return state.office;
}
