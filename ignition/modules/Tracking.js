const { buildModule } = require('@nomicfoundation/hardhat-ignition/modules');

module.exports = buildModule('TrackingModule', (m) => {
  const trackingContract = m.contract('Tracking');

  return { trackingContract };
});
