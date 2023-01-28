export function pause(val:500) {
  return new Promise(resolve => {
    setTimeout(resolve, val);
  })
}
