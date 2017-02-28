'use script';

module.exports = function mobileFlow(runner, argv) {
  return previousResolution => {
    runner.actStart('Mobile Flow');
    runner.actEnd('Mobile Flow');
    return Promise.resolve(previousResolution);
  };
};
