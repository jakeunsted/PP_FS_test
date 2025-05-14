module.exports = {
  attributes: {
    city: {
      type: 'string',
      required: true
    },
    latitude: {
      type: 'number',
      required: true
    },
    longitude: {
      type: 'number',
      required: true
    },
    temperature: {
      type: 'number',
      required: true
    },
    condition: {
      type: 'string',
      required: true
    },
    timestamp: {
      type: 'ref',
      columnType: 'datetime',
      defaultsTo: new Date()
    }
  }
}; 