function matchStage(currentStage, stage) {
  const matches = currentStage.match(new RegExp(stage));
  return !!(matches && matches.length > 0);
}

module.exports = matchStage;