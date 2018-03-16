const Command = require('command'),
	path = require('path'),
	fs = require('fs'),

//Note: For changers with stack count (like height/chest/thigh/grow), Use stack = 1,2,3 for -3 to -1, 4 for regular 0 (no effect) and 5,6,7 for +1 to +3. Respectively.
//You can customise stacks by changing defaults OR use a stack argument when using commands 'changer' or 'changersave'.
//Example: 'changer misterdoctor height 7' command apply a +3 height changer to misterdoctor.

//List of Abnormality ID:
	abnId=[7000005,7000001,7000012,7000013,7000014,7777001],  //Abnormality ID
	abnCmd=['grow','bighead','chest','height','thigh','selfconfidence'] //chat command argument, corresponding to the ID above.
	
//Defaults
let DELETE_ALSO_ENDS_CHANGERS=true, //This changes whether using command 'changerdelete' will end the changers on the target too. True to end together with deletion.
	MESSAGE_AUTO_CHANGES=true, 		//This notifies you via ingame messages if someone has been automatically changed. True to notify.
	MESSAGE_CHANGES=true,			//This notifies you via ingame messages for changer command confirmation. True to notify and spam.
	enabled=true,					//Default Enable/disable of module. True to Enable
	autochange=true, 				//Default Enable/disable of auto changing save person. True to autochange saved targets.
	autosave=false,					//Default auto saving applied changers on others. True to automatically save on every changer command.
	stacks=1						//Default number of stack.

	
	
module.exports = function changeevery(dispatch) {
	const command = Command(dispatch)
	
	let players=[], //store as 2 arrays, searches faster
		playernamelist=[],
		customdata={},
		fileopen=true,
		stopwrite,
		saveonce,
		abnindex,
		nameindex,
		index
	
	try {customdata = require('./playerdata.json')}
	catch(e) {customdata = {}}
	
	
	//Commands
	command.add('changertoggle', () => {
		if(enabled) {         //Disabling Module flushes saved lists
			enabled=false,
			players=[],
			playernamelist=[],
			command.message('(ChangeEveryone) Module Disabled')
		}
		else
			enabled=true,
			command.message('(ChangeEveryone) Module Enabled')
	})	
	
	
	command.add('changerautosave', () => {
		if(autosave) {
			autosave=false,
			command.message('(ChangeEveryone) Autosave Disabled')
		}
		else
			autosave=true,
			command.message('(ChangeEveryone) Autosave Enabled')
	})
	
	
	command.add('changerautochange', () => {
		if(autochange) {
			autochange=false,
			command.message('(ChangeEveryone) Autochange Disabled')
		}
		else
			autochange=true,
			command.message('(ChangeEveryone) Autochange Enabled')
	})
	
	
	command.add('changerstack', stack => {
		stacks=parseInt(stack),
		command.message('(ChangeEveryone) Default stack changed to '+stacks)
	})
	
	
	command.add('changer', (name,cmd,cmdstack) => {
		nameindex=playernamelist.indexOf(name.toLowerCase()),
		abnindex=abnCmd.indexOf(cmd.toLowerCase())
		
		if(cmdstack===undefined) cmdstack=stacks  //if stacks is not input, revert to default
		
		if(abnindex>-1 && nameindex>-1) {
			applyabnormal(players[nameindex],abnId[abnindex],cmdstack,name,cmd)
		}
	
		else if(!isNaN(cmd) && nameindex>-1) { //check cmd is a number
			applyabnormal(players[nameindex],parseInt(cmd),cmdstack,name,cmd)
		}
	
		else
			enabled ? command.message('(ChangeEveryone) No name found in saved list/Incorrect argument input.') :
			command.message('(ChangeEveryone) Module is Disabled! Enable module and re-enter region to load user names')
	})
	
	
	command.add('changersave', (name,cmd,cmdstack) => {
		nameindex=playernamelist.indexOf(name.toLowerCase()),
		abnindex=abnCmd.indexOf(cmd.toLowerCase())
		
		if(cmdstack===undefined) cmdstack=stacks
		
		if(abnindex>-1 && nameindex>-1) {
			saveonce=true
			applyabnormal(players[nameindex],abnId[abnindex],cmdstack,name,cmd)
		}
	
		else if(!isNaN(cmd) && nameindex>-1) { //check cmd is a number
			saveonce=true
			applyabnormal(players[nameindex],parseInt(cmd),cmdstack,name,cmd)
		}	
	
		else
			enabled ? command.message('(ChangeEveryone) No name found in saved list/Incorrect argument input.') :
			command.message('(ChangeEveryone) Module is Disabled! Enable module and re-enter region to load user names')
	})
	
	
	command.add('changerend', (name,cmd) => {
		nameindex=playernamelist.indexOf(name.toLowerCase()),
		abnindex=abnCmd.indexOf(cmd.toLowerCase())
		
		if(autosave) deleteentry(name.toLowerCase(),cmd.toLowerCase())

		if(nameindex>-1) {
			
			if(abnindex>-1) {
				abend(players[nameindex],abnId[abnindex])
				if(MESSAGE_CHANGES) command.message('(ChangeEveryone) Ended changer '+cmd+' on '+name) 
			}	
		
			else if(!isNaN(cmd)) {      //check cmd is a number
				abend(players[nameindex],parseInt(cmd))
				if(MESSAGE_CHANGES) command.message('(ChangeEveryone) Ended changer '+cmd+' on '+name) 
			}
	
			else if(cmd==='all' && customdata[name.toLowerCase()]) {
				Object.keys(customdata[name.toLowerCase()]).forEach(key => {
					abend(players[nameindex],parseInt(key))
				})
				if(MESSAGE_CHANGES) command.message('(ChangeEveryone) Ended all changers on '+name) 
			}
		
			else
				enabled ? command.message('(ChangeEveryone) No name found in saved list/Incorrect argument input.') :
				command.message('(ChangeEveryone) Module is Disabled! Enable module and re-enter region to load user names')
		}
		else
			command.message('(ChangeEveryone) No such name found. Reload location or enable module if disabled.')
	})
	
	
	command.add('changerdelete', (name,cmd) => {
		nameindex=playernamelist.indexOf(name.toLowerCase()),
		abnindex=abnCmd.indexOf(cmd.toLowerCase()),
		deleteentry(name.toLowerCase(),cmd.toLowerCase())
		
		if(DELETE_ALSO_ENDS_CHANGERS) {
			if(abnindex>-1 && nameindex>-1) {
				abend(players[nameindex],abnId[abnindex])
				if(MESSAGE_CHANGES) command.message('(ChangeEveryone) Ended changer '+cmd+' on '+name)
			}
			
			else if(!isNaN(cmd) && nameindex>-1) {//check cmd is a number
				abend(players[nameindex],parseInt(cmd))
				if(MESSAGE_CHANGES) command.message('(ChangeEveryone) Ended changer '+cmd+' on '+name)
			}
		
			else if(cmd==='all' && customdata[name.toLowerCase()]) {
				Object.keys(customdata[name.toLowerCase()]).forEach(key => {
					abend(players[nameindex],parseInt(key))
				})
				if(MESSAGE_CHANGES) command.message('(ChangeEveryone) Ended all changers on '+name) 
			}
		}
	})
	
	
	//Dispatches
	dispatch.hook('S_SPAWN_USER', 12, {fake:null}, event => {
		if(enabled)	{
			if(!playernamelist.includes(event.name.toLowerCase())) {
				players.push(event.gameId),
				playernamelist.push(event.name.toLowerCase())
			}
		}

		if(autochange) {
			if(customdata[event.name.toLowerCase()]) {
				if(MESSAGE_AUTO_CHANGES) command.message('(ChangeEveryone) Changed '+event.name)
				process.nextTick(() => {  	//Must send abnormalities after S_SPAWN_USER
					Object.entries(customdata[event.name.toLowerCase()]).forEach(([key,value]) => {
						abbegin(event.gameId,parseInt(key),parseInt(value))
					})
				})
			}
		}
	})
	
	dispatch.hook('S_DESPAWN_USER',1,event => {
		if(enabled) {
			for(var i=0; i<players.length ;i++) {  //Must use classic for loop to search for objects in arrays (Alternative?)
				if(event.target.equals(players[i])) {	
					players.splice(i,1),
					playernamelist.splice(i,1)
					break
				}
			}
		}
	})

	dispatch.hook('S_LOAD_TOPO','raw', event => { 
		players=[],
		playernamelist=[]
	})
	

	//Functions
	function abbegin(playerid,abid,stack) {	
		dispatch.toClient('S_ABNORMALITY_BEGIN', 2, {
			target: playerid, 
			source: playerid, 
			id:abid,
			duration: 999999000, //in milsec= 999999sec
			unk:0,
			stacks: stack,
			unk2:0
		})
	}
	
	
	function abend(playerid,abid) {
		dispatch.toClient('S_ABNORMALITY_END', 1, {
			target:playerid,
			id:abid
		})
	}
	
	
	function applyabnormal(playerid,abid,stack,name,changername) {
		if(!isNaN(stack)) {  //Check stacks is a number
			abbegin(playerid,abid,parseInt(stack))
			
			if(MESSAGE_CHANGES) command.message('(ChangeEveryone) Changer '+changername+ ' (stack: '+stack+') applied on '+ name)

			if(autosave || saveonce) {
				if(!customdata[name]) Object.assign(customdata,{[name]:{}}) //create object if it does not exist. Important.
				
				customdata[name][abid]=stack,
				saveonce=false
				saveplayer()
				command.message('(ChangeEveryone) Save file Written. Added new entry for '+ name)
			}
		}
		
		else
			command.message('(ChangeEveryone) Invalid stack input. Please only input numbers for stack count.')
	}
	
	
	function deleteentry(name,cmd) {
		if(customdata[name]) {
			// Delete all
			if(cmd==='all')  {
				delete customdata[name]
				saveplayer(),
				command.message('(ChangeEveryone) Deleted all saved changer entries for '+name) 
			}
			
			// Delete those changers with string words
			else if(abnCmd.indexOf(cmd)>-1) {
				abnindex=abnCmd.indexOf(cmd)
				if(customdata[name][abnId[abnindex]]) {
					delete customdata[name][abnId[abnindex]]
					saveplayer(),
					command.message('(ChangeEveryone) Deleted changer entry '+cmd+' for '+name)
				}
				else command.message('(ChangeEveryone) No entry '+cmd+' in savefile found for '+name)
			}
			
			// Delete customised changers inputted using Id
			else if(!isNaN(cmd)) {
				if(customdata[name][parseInt(cmd)]) {
					delete customdata[name][parseInt(cmd)]
					saveplayer(),
					command.message('(ChangeEveryone) Deleted changer entry '+cmd+' for '+name)
				}
				else command.message('(ChangeEveryone) No entry '+cmd+' in savefile found for '+name)
			}
			
			// Invalid Command
			else
				command.message('(ChangeEveryone) Invalid changer name/ changer ID input, check command.')
		}
		else
			command.message('(ChangeEveryone) No entries for '+ name+' found in savefile. Check spelling of name')
	}
	
	
	function saveplayer() {
		if(fileopen) {
			fileopen=false
			fs.writeFile(path.join(__dirname,'playerdata.json'), JSON.stringify(customdata), err => {
				if(err) command.message('(ChangeEveryone) Error writing file, attempting to rewrite. If message persist, restart game and proxy')
				else fileopen = true
			})
		}
		else {
			clearTimeout(stopwrite)  //if file still being written
			stopwrite=setTimeout(saveplayer(),2000)
			return
		}
	}
	
	
	function debug(string) {
		console.log(JSON.stringify(string))
	}
}
	
