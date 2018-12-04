const random = array => { return array[Math.floor(Math.random() * array.length)] }
module.exports={
	getWord : () => {
	  const answers = [
	    'Hai pengiriman biasa nya dilakukuan dengan jasa pengiriman ekspedisi dengan waktu 3-7 hari pengiriman di area pulau jawa'
	  ]
	  return random(answers);
	}	
}