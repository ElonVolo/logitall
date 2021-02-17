function doStuff(...myArray) {
  console.log(
    "[logitall]  __testfixtures__/function-rest-parameter.input.ts:1:doStuff(...myArray)"
  );

  console.log(
    `[logitall]  	__testfixtures__/function-rest-parameter.input.ts:1:doStuff:param myArray value: 
                    ${JSON.stringify(myArray)}`
  );

  let stuff = 'things';
}
