let testLog = (paramOne, paramTwo) => {
  console.log(
    "[logitall]  __testfixtures__/function-arrow-logparams.input.ts:1:(paramOne, paramTwo) => {}"
  );

  console.log(
    `[logitall]  	__testfixtures__/function-arrow-logparams.input.ts:1::param paramOne value: 
                    ${JSON.stringify(paramOne)}`
  );

  console.log(
    `[logitall]  	__testfixtures__/function-arrow-logparams.input.ts:1::param paramTwo value: 
                    ${JSON.stringify(paramTwo)}`
  );
};