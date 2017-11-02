export const toMap = (key, array) =>
  array.reduce((map, item) => ({ ...map, [item[key]]: item }), {})
