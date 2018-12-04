const random = array => { return array[Math.floor(Math.random() * array.length)] }
module.exports={
	getGreetings : () => {
	  const answers = [
	    `Hello!`,
	    `Yo ;)`,
	    `Hey, nice to see you.`,
	    `Welcome back!`,
	    `Hi, how can I help you?`,
	    `Hey, what do you need?`,
	    'Hey, what gonna do?'
	  ]
	  return random(answers);
	}	
}



