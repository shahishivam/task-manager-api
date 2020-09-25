const { calculateTip,fahrenheitToCelsius,celsiusToFahrenheit } = require('../src/math')

test('Calculate total money',()=>{
  const total = calculateTip(10,0.3)
  expect(total).toBe(13)
  // if(total!=13){
  //   throw new Error('Total tip should be 13. Got '+total)
  // }
})

test('Test temperature conversion functions',()=>{
  expect(fahrenheitToCelsius(32)).toBe(0)
  expect(celsiusToFahrenheit(0)).toBe(32)
})

test('Async test demo',(done)=>{
  setTimeout(()=>{
    expect(2).toBe(2)
    done()
  },2000)

})
