const random = array => { return array[Math.floor(Math.random() * array.length)] }
module.exports={
	getWord : () => {
	  const answers = [
	    `Terimakasih`,
	    `Terimakasih telah bertransaksi dengan kami;)`,
	    `Hehe Terimakasih :) `,
	    'Terimakasih, senang dapat membantu anda'
	  ]
	  return random(answers);
	}	
}



