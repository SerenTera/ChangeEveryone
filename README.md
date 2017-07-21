# ChangeEveryone
A Tera Proxy module that applies changers/ abnormalities onto others. Client Sided.

Version 1.0.0: Initial Commit

Requires:
- Commands module by Pinkie-Pie: https://github.com/pinkipi/command
- NodeJS version 7.5.0 or above (NodeJS v8 ++ is recommended)

## General instruction
This module applies common shape changers and has support for customised abnormality you want to apply via ID. Also allows you to save the applied changers and reapply them automatically on saved targets. Savefile is created in the same module folder (playerdata.json) when targets are saved, working through logouts and location changes.

There are 3 defaults that are not changeable by commands. They can be changed under the 'defaults' section in index.js :
- DELETE_ALSO_ENDS_CHANGERS (This changes whether using command 'changerdelete' will end the changers on the target too. True to end together with deletion)

- MESSAGE_AUTO_CHANGES		  (This notifies you via ingame messages if someone that is saved in the savefile has been automatically changed. True to notify)

- MESSAGE_CHANGES     			(This notifies you via ingame messages for changer commands confirmation. True to notify but can be spammy)

Other various defaults can be changed in index.js too. Refer to comments in the file.

## Commands
Type commands in /proxy chat (aka /8 chat) or prefix with '!' if you want to type in any other chat channels. Name or ign can be in any capitalization, only spelling matters.

General commands:
- changertoggle: Enable/disable module. Disabling flushes out a list of ign in you vicinity, so you have to re-enter location to use module again after re-enabling module.

- changerautosave: Enable/disable autosaving feature. Autosaving allows every changer command changes (be it the application or ending of a shape changer/other abnormality) to be saved into the savefile (playerdata.json) automatically so that any changers that are applied/deleted from a target will be re-applied/stay deleted from them in any future encounters. 

- changerautochange: Enable/disable autochanging feature. This feature just allows you to automatically apply changers/custom abnormalities on anyone saved by this module in the savefile , everytime they load into you vicinity. Disable will not interfere with the savefile, just that they will not be automatically changed.

- changerstack \<stackcount>: Changes the default stack to stackcount. Will be resetted on logout, change 'stacks' in index.js defaults for a permanent change. Example: 'changerstack 4' changes the default stack to 4 only for that proxy session.

Changer commands:
- changer \<name> \<changer name> <stack count(optional)>: Applies \<changers name> onto the \<name> target, with the stack count being the one in this command (if entered) OR the default one, if left blank. See 'changers' section in this readme for more info. Does NOT SAVE the changers applied on the target unless autosave is enabled. Example: 'changer seren height 3' applies a -1 height changer to seren. 'changer seren height' applies the default (stacks=1 is default unless changed) stack of height changer to seren (-3 height change if left default stack of 1). 

- changersave \<name> \<changer name> <stack count(optional)>: Same principle as above, but this time, it saves the name, changer applied and stack to the save file.  Example: 'changer seren height 3' applies a -1 height changer to seren and save it. Not entering stack count uses default stack instead.

- changerend \<name> \<changername>: Ends the effect of the changer in this argument: \<changername> on the named target. Does not save the removal UNLESS autosave is enabled, only ends the effect, so if target is encountered again, any saved shape changers will be re-applied on the target. Note that the removal will carry out even if the effect is not applied on the target in the first place, just that there will be no changes thats all. If you have the target saved in the savefile, you can use 'all' for changername (eg. 'changerend seren all') to end all saved effects on the target.Example: 'changerend seren bighead' ends the bighead effect on seren. 

- changerdelete \<name> \<changername>: Same as above, ends effect on the target, BUT will also delete the entry from the \<name> target in the savefile, so future encounter will not be apply this changer. Example: 'changerdelete seren bighead' will delete the bighead entry from seren in the savefile, so future encounter with seren will not apply big head effect on seren, however, other existing entries will be kept for seren and others. Similarly, you can use 'all' to delete all changers from the \<name> target in the savefile, this will delete the whole name entry from the savefile and you should not see the named ign in the savefile anymore(applicable to 'all' only). Example: 'changerdelete seren all' will delete seren from the savefile.

## Changers
#### Preset Changer name
A list of changername can be found in index.js, but they are here too. There are 6 preset changers :

grow,bighead,chest,height,thigh,selfconfidence

They should be self explainatory on their effects and usage can be seen from the examples in the commands section. 'grow' is the grow/shrink potion, shrink uses 0? or 1? or -1? i forgot, test it out. More examples: 'changer seren chest 3' , 'changersave seren thigh 6',  'changerdelete seren thigh', 'changerend seren chest' 

For reference, they correspond to the following abnormality id respectively: 7000005,7000001,7000012,7000013,7000014,7777001

#### Stack count
While most abnomalities uses 1 as stack count, some changers, such as height, grow, thigh and chest changers has a stack on them (+3 thigh changer, -2 height changer etc...) Stack count controls the stack for these changers.

Normally, the stack are:

-3 to -1 : stack count 1-3 (1 corresponds to -3, 3 corresponds to -1)

0: stack count 4

+1 to +3 : stack count 5-7 (5 corresponds to +1, 7 corrresponds to +3)

So, if I want to apply a +3 height change to seren, I will type in 'changer seren height 7' (or changersave if i want to save this into savefile).

However, Some changers have a weird unlimited scaling factor. One of such changer is the grow/shrink changer (preset changer name 'grow'), where the stack can go negative too. The higher the number the bigger the character, going to 100 creates a giant character.

#### Custom changers
You can also type in custom abnormality ids if they are not covered by the preset changer name, in the \<changer name> field in the commands. For example: 'changer seren 806001 1' will put 1 stack of Expiring Anthrozombie Elixir (aka zombie potion) on seren. this works for all 4 changer commands, you can save the applied abnormality on the target using 'changersave' or delete using 'changerdelete', Just make sure you use the same abnormality ids

A list of abnormality ids is provided in this module as well, find it at 'abnormality ids.txt'.

If you want you can also add in your own preset changer name in index.js, under 'List of Abnormality ID:' section. names goes to abnCmd array with quotation marks (' ') and abnomality id goes to abnId array. Their indexes must correspond (ie: 'chest' is the 3rd one in abnCmd, abnormality id for chest changer must be the 3rd one in abnId).

## Compatibility issues and bugs:
This module is not extensively tested due to lack of personal time. Might cause compatibility issue with other module that uses 'S_SPAWN_USER' (hopefully not). 

If using with dressupmyfriends, make sure negatechangers in dressupmyfriends/index.js is set to false or else using any dressup commands in dressupmyfriends will end abnormality/changers imposed by this module.

If the target has unwanted abnormalities, dressupmyfriends does block out the abnormality from even starting, only if you save the person already. If not, you can use changerend to end the unwanted changer/abnormality.

## Todo
- fix bugs
- automatically stop unwanted abnormality from starting. Highly likely will not be implemented due to lack of time on my hands.
