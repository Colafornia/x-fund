export default (state = [], action) => {
  switch (action.type) {
    case 'UPDATE':
        return action.funds;
    default:
      return state;
  }
}
