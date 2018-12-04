const random = array => { return array[Math.floor(Math.random() * array.length)] }
module.exports={
	getWord : (bank) => {
	  const answers = {'bank':[{'bank':'bank mandiri','no_rek':'20202020202'},{'bank':'bank bni ','no_rek':'938498394'},{'bank':'bank bni','no_rek':'29382983'}]};
	  var bankapa=bank;

	  for (var i = 0; i< answers.bank.length; i++) {

	  	if(answers.bank[i].bank==bankapa.toLowerCase()){
	  		return answers.bank[i].no_rek;
	  	}
	  
	  }
	}	
}