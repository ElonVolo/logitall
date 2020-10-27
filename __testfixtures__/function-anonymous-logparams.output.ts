let testLog = function(paramOne, paramTwo) {
  console.log(
    "[logitall]  __testfixtures__/function-anonymous-logparams.input.ts:1:function(paramOne, paramTwo)"
  );

  console.log(
    `[logitall]  	__testfixtures__/function-anonymous-logparams.input.ts:1::param paramOne value: 
                    ${JSON.stringify(paramOne)}`
  );

  console.log(
    `[logitall]  	__testfixtures__/function-anonymous-logparams.input.ts:1::param paramTwo value: 
                    ${JSON.stringify(paramTwo)}`
  );
}