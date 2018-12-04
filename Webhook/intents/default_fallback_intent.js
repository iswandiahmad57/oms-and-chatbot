const random = array => { return array[Math.floor(Math.random() * array.length)] }
module.exports={
	getAnswer: () => {
	  const answers = [
	  	'Maaf kami tidak mengerti apa yang Anda maksud',
	  	'Apa yang Anda maksudkan?',
	  	'Bisa ulangi lagi?'
	  ]
	  return random(answers);
	}	
}



