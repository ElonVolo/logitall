function testLog(paramOne, paramTwo) {
  console.log(
    "[logitall]  __testfixtures__/function-declaration-logparams.input.ts:1:testLog(paramOne, paramTwo)"
  );

  console.log(
    `[logitall]  	__testfixtures__/function-declaration-logparams.input.ts:1:testLog:param paramOne value: 
                    ${JSON.stringify(paramOne)}`
  );

  console.log(
    `[logitall]  	__testfixtures__/function-declaration-logparams.input.ts:1:testLog:param paramTwo value: 
                    ${JSON.stringify(paramTwo)}`
  );
}