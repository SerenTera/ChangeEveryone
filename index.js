const path = require('path'),
	fs = require('fs'),
	Long = require('long'),
	defaultConfig = require('./lib/configDefault.json')
//Note: For changers with stack count (like height/chest/thigh/grow), Use stack = 1,2,3 for -3 to -1, 4 for regular 0 (no effect) and 5,6,7 for +1 to +3. Respectively.
//You can customise stacks by changing defaults OR use a stack argument when using commands 'changer' or 'changersave'.
//Example: 'changer misterdoctor height 7' command apply a +3 height changer to misterdoctor.
//Configs in config.json, If not present, will automatically be generated on first login with default presets.
	
module.exports = function changeevery(mod) {
	
	
	let players = {},
		customdata = {},
		fileopen = true,
		changed = false,
		debugs = false,
		stopwrite,
		saveonce,
		config,
		DELETE_ALSO_ENDS_CHANGERS, //Configs
		MESSAGE_AUTO_CHANGES,
		MESSAGE_CHANGES,
		enabled,
		autochange,
		autosave,
		stacks,
		abnId
		
		
	
	try {customdata = require('./playerdata.json')}
	catch(e) {customdata = {}}
	
	try {
		config = JSON.parse(fs.readFileSync(path.join(__dirname,'config.json'), 'utf8'))
		if(config.moduleVersion !== defaultConfig.moduleVersion) {
			config = Object.assign({},defaultConfig,config,{moduleVersion:defaultConfig.moduleVersion})
			saveconfig()
			console.log('[ChangeEveryone] Updated new config file. Current settings transferred over.')
		}
		init()
	}
	catch(e) {
		config = defaultConfig
		saveconfig()
		init()
		console.log('[ChangeEveryone] Initated a new config file due to missing config file. Add your default config in config.json.')
	}	
	
	//Commands
	mod.command.add('changer', {
		$default() {
			mod.command.message('(ChangeEveryone) Wrong Command')
		},	
		
		toggle() {
			if(enabled) {         //Disabling Module flushes saved lists
				enabled=false
				players={}
				mod.command.message('(ChangeEveryone) Module Disabled')
			}
			else {
				enabled=true
				mod.command.message('(ChangeEveryone) Module Enabled')
			}
		},	
	
	
		autosave() {
			autosave = !autosave
			mod.command.message(`(ChangeEveryone) Autosave ${autosave ? 'Enabled' : 'Disabled'}`)
		},
	
	
		autochange() {
			autochange = !autochange
			mod.command.message(`(ChangeEveryone) Autochange ${autochange ? 'Enabled' : 'Disabled'}`)
		},
	
	
		stack(stack) {
			stacks=parseInt(stack),
			mod.command.message('(ChangeEveryone) Default stack changed to '+stacks)
		},
	
	
		apply(name,cmd,cmdstack) {
			cmd = cmd.toLowerCase()
			if(cmdstack===undefined) cmdstack = stacks
			if(!abnId[cmd] && isNaN(cmd)) {
				mod.command.message('(ChangeEveryone) Incorrect Abnormality name/Abnormality is not a number.') 
				return
			}
			changed = false
			Object.entries(players).forEach(([key,value]) => {
				if(name.toLowerCase() == value) {
					applyabnormal(key,abnId[cmd] ? abnId[cmd] : parseInt(cmd),cmdstack,name,cmd)
					changed = true
					return
				}
			})
		
			if(!changed) {
				enabled ? mod.command.message('(ChangeEveryone) No name found in saved list/Incorrect argument input.') :
				mod.command.message('(ChangeEveryone) Module is Disabled! Enable module and re-enter region to load user names')
			}	
		},
	
	
		save(name,cmd,cmdstack) {
			cmd = cmd.toLowerCase()
			if(cmdstack === undefined) cmdstack = stacks
			if(!abnId[cmd] && isNaN(cmd)) {
				mod.command.message('(ChangeEveryone) Incorrect Abnormality name/Abnormality is not a number.') 
				return
			}
		
			changed = false
			Object.entries(players).forEach(([key,value]) => {
				if(name.toLowerCase() === value) {
					saveonce = true
					applyabnormal(key,abnId[cmd] ? abnId[cmd] : parseInt(cmd),cmdstack,name,cmd)
					changed = true
					return
				}
			})
		
			if(!changed) {
				enabled ? mod.command.message('(ChangeEveryone) No name found in saved list/Incorrect argument input.') :
				mod.command.message('(ChangeEveryone) Module is Disabled! Enable module and re-enter region to load user names')
			}
		},
	
	
		end(name,cmd) {		
			cmd = cmd.toLowerCase()
			if(!abnId[cmd] && (isNaN(cmd) || cmd==='all')) {
				mod.command.message('(ChangeEveryone) Incorrect Abnormality name/ Abnormality is not a number/ "all" command wrongly spelled') 
				return
			}
		
			changed = false
			Object.entries(players).forEach(([key,value]) => {		
				if(name.toLowerCase() === value) {
					if(cmd ==='all' && customdata[name.toLowerCase()]) {
						for(let k of Object.keys(customdata[name.toLowerCase()])) {
							abend(value,parseInt(k))
						}
						if(MESSAGE_CHANGES) mod.command.message('(ChangeEveryone) Ended all changers on '+name) 
					}
			
					else { 
						abend(key,abnId[cmd] ? abnId[cmd] : parseInt(cmd))
						if(MESSAGE_CHANGES) mod.command.message('(ChangeEveryone) Ended changer '+cmd+' on '+name) 
					
					}
					if(autosave) deleteentry(name.toLowerCase(),cmd);
					changed = true	
					return
				}
			})
		
			if(!changed) {
				enabled ? mod.command.message('(ChangeEveryone) No name found in saved list/Incorrect argument input.') :
				mod.command.message('(ChangeEveryone) Module is Disabled! Enable module and re-enter region to load user names')
			}
		},
		
	
		delete(name,cmd) {
			cmd = cmd.toLowerCase()
		
			if(!abnId[cmd] && (isNaN(cmd) || cmd==='all')) {
				mod.command.message('(ChangeEveryone) Incorrect Abnormality name/ Abnormality is not a number/ "all" command wrongly spelled') 
				return
			}
			if(!DELETE_ALSO_ENDS_CHANGERS) deleteentry(name.toLowerCase(),cmd)
		
			else {
				changed = false
				Object.entries(players).forEach(([key,value]) => {		
					if(name.toLowerCase() === value) {
						if(cmd==='all' && customdata[name.toLowerCase()]) {
							for(let k of Object.keys(customdata[name.toLowerCase()])) abend(value,parseInt(k));
							if(MESSAGE_CHANGES) mod.command.message('(ChangeEveryone) Ended all changers on '+name) 
						}	
			
						else { 
							abend(key,abnId[cmd] ? abnId[cmd] : parseInt(cmd))
							if(MESSAGE_CHANGES) mod.command.message('(ChangeEveryone) Ended changer '+cmd+' on '+name) 
						}
						deleteentry(name.toLowerCase(),cmd)
						changed = true
						return
					}
				})
				if(!changed) {
					enabled ? mod.command.message('(ChangeEveryone) No name found in saved list/Incorrect argument input.') :
					mod.command.message('(ChangeEveryone) Module is Disabled! Enable module and re-enter region to load user names')
				}
			}
		}
	})
	
	
	//Dispatches
	mod.hook('S_SPAWN_USER', 13, {order:100,filter:{fake: null}}, event => {
		if(enabled)	{
			if(!players[event.gameId]) players[event.gameId] = event.name.toLowerCase()
		}
		
		if(autochange) {
			if(customdata[event.name.toLowerCase()]) {
				if(MESSAGE_AUTO_CHANGES) mod.command.message('(ChangeEveryone) Changed '+event.name)
				process.nextTick(() => {  	//Must send abnormalities after S_SPAWN_USER
					Object.entries(customdata[event.name.toLowerCase()]).forEach(([key,value]) => {
						abbegin(event.gameId,parseInt(key),parseInt(value))
					})
				})
			}
		}
		
	})
	
	mod.hook('S_DESPAWN_USER',3, {filter:{fake:null}}, event => {
		if(enabled && players[event.gameId]) delete players[event.gameId]
	})

	mod.hook('S_LOAD_TOPO','raw', () => { 
		players={}
	})
	

	//Functions
	function abbegin(playerid,abid,stack) {	
		if(!Long.isLong(playerid)) playerid = Long.fromString(playerid, true) //Convert to Long object again if not a long object
		mod.send('S_ABNORMALITY_BEGIN', 2, {
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
		if(!Long.isLong(playerid)) playerid = Long.fromString(playerid, true)
		mod.send('S_ABNORMALITY_END', 1, {
			target:playerid,
			id:parseInt(abid)
		})
	}
	
	
	function applyabnormal(playerid,abid,stack,name,changername) {
		if(!isNaN(stack)) {  //Check stacks is a number
			abbegin(playerid,parseInt(abid),parseInt(stack))
			
			if(MESSAGE_CHANGES) mod.command.message('(ChangeEveryone) Changer '+changername+ ' (stack: '+stack+') applied on '+ name)

			if(autosave || saveonce) {
				if(!customdata[name]) Object.assign(customdata,{[name]:{}}) //create object if it does not exist. Important.
				
				customdata[name][abid] = stack
				saveonce=false
				saveplayer()
				mod.command.message('(ChangeEveryone) Save file Written. Added new entry for '+ name)
			}
		}
		
		else
			mod.command.message('(ChangeEveryone) Invalid stack input. Please only input numbers for stack count.')
	}
	
	
	function deleteentry(name,cmd) {
		if(customdata[name]) {
			// Delete all
			if(cmd==='all')  {
				delete customdata[name]
				saveplayer()
				mod.command.message('(ChangeEveryone) Deleted all saved changer entries for '+name) 
			}
			
			// Delete those changers with string words
			else if(abnId[cmd]) {
				if(customdata[name][abnId[cmd]]) {
					delete customdata[name][abnId[cmd]]
					saveplayer()
					mod.command.message('(ChangeEveryone) Deleted changer entry '+cmd+' for '+name)
				}
				else mod.command.message('(ChangeEveryone) No entry '+cmd+' in savefile found for '+name)
			}
			
			// Delete customised changers inputted using Id
			else if(!isNaN(cmd)) {
				if(customdata[name][parseInt(cmd)]) {
					delete customdata[name][parseInt(cmd)]
					saveplayer()
					mod.command.message('(ChangeEveryone) Deleted changer entry '+cmd+' for '+name)
				}
				else mod.command.message('(ChangeEveryone) No entry '+cmd+' in savefile found for '+name)
			}
			
			// Invalid Command
			else
				mod.command.message('(ChangeEveryone) Invalid changer name/ changer ID input, check command.')
		}
		else
			mod.command.message('(ChangeEveryone) No entries for '+ name+' found in savefile. Check spelling of name')
	}
	
	
	function saveplayer() {
		if(fileopen) {
			fileopen = false
			fs.writeFile(path.join(__dirname,'playerdata.json'), JSON.stringify(customdata,null,"\t"), err => {
				if(err) mod.command.message('(ChangeEveryone) Error writing file, attempting to rewrite. If message persist, restart game and proxy')
				else fileopen = true
			})
		}
		else {
			clearTimeout(stopwrite)  //if file still being written
			stopwrite = setTimeout(saveplayer(),2000)
			return
		}
	}
	
	function saveconfig() { //screw combining it together with the previous function, im too lazy
		if(fileopen) {
			fileopen = false
			fs.writeFile(path.join(__dirname,'config.json'), JSON.stringify(config,null,"\t"), err => {
				if(err) console.log('(ChangeEveryone) Error writing file, attempting to rewrite. If message persist, restart game and proxy')
				else fileopen = true
			})
		}
		else {
			clearTimeout(stopwrite)  //if file still being written
			stopwrite = setTimeout(saveconfig(),2000)
			return
		}
	}
	
	function debug(string) {
		if(debugs) console.log(string)
	}
	function init() {
		({DELETE_ALSO_ENDS_CHANGERS,MESSAGE_AUTO_CHANGES,MESSAGE_CHANGES,enabled,autochange,autosave,stacks,abnId} = config)
	}		

	
}
	
