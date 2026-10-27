// @ts-nocheck
import React,{useEffect,useMemo,useState} from 'react'
import {Appearance,SafeAreaView,ScrollView,StatusBar,StyleSheet,Text,TouchableOpacity,View,TextInput} from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import * as Speech from 'expo-speech'
import {WORDS} from './src/words'
import {WORD_DETAILS} from './src/wordDetails'
import {getPlan,initialState,rateWord,State,Rating,todayKey} from './src/model'
const key='easyword-v1'
const palettes={light:{bg:'#f3f2ed',card:'#fbfaf6',ink:'#282c27',muted:'#7c8179',line:'#e5e4dd',green:'#607967',pale:'#e9eee8',orange:'#ad805b',red:'#a96e69',softRed:'#f3e9e7'},dark:{bg:'#191c1a',card:'#242925',ink:'#eef0e9',muted:'#a4aaa2',line:'#353c37',green:'#a7c0a5',pale:'#303a32',orange:'#d0a47e',red:'#ce928b',softRed:'#3b2d2c'}}
const wordIllustrations:Record<string,string>={'cet4-abandon':'🧳','cet4-absorb':'🧽','cet4-achieve':'🏆','cet4-adapt':'🦎','cet4-benefit':'🌱','cet4-challenge':'🧗','cet4-complex':'🧩','cet4-evidence':'🔍','cet4-focus':'🎯','cet4-improve':'📈','cet6-abstract':'☁️','cet6-advocate':'📣','cet6-consensus':'🤝','cet6-diminish':'📉','cet6-inevitable':'⏳','cet6-integrity':'🧭','cet6-notion':'💡','cet6-substantial':'🏋️','cet6-sustain':'🌉','cet6-undermine':'🪨'}
type Tab='today'|'learn'|'me';type Session='new'|'review'|'rapid'|null;type StudyMode='normal'|'spelling'|'picture';type DetailTab='collocations'|'derivatives'|'synonyms'|'confusables'
export default function App(){
 const [state,setState]=useState<State>(initialState),[loaded,setLoaded]=useState(false),[tab,setTab]=useState<Tab>('today'),[screen,setScreen]=useState('home')
 const [session,setSession]=useState<Session>(null),[queue,setQueue]=useState<string[]>([]),[currentId,setCurrentId]=useState<string|null>(null),[answer,setAnswer]=useState<number|null>(null),[rated,setRated]=useState(false),[detailOpen,setDetailOpen]=useState(false),[search,setSearch]=useState(''),[note,setNote]=useState(''),[studyMode,setStudyMode]=useState<StudyMode>('normal'),[studyMenuOpen,setStudyMenuOpen]=useState(false),[detailTab,setDetailTab]=useState<DetailTab>('collocations'),[spellingInput,setSpellingInput]=useState(''),[spellingResult,setSpellingResult]=useState<boolean|null>(null),[systemDark,setSystemDark]=useState(Appearance.getColorScheme()==='dark')
 useEffect(()=>{AsyncStorage.getItem(key).then(raw=>{if(raw)try{setState({...initialState,...JSON.parse(raw)})}catch{};setLoaded(true)});const sub=Appearance.addChangeListener(({colorScheme})=>setSystemDark(colorScheme==='dark'));return()=>sub.remove()},[])
 useEffect(()=>{if(loaded)AsyncStorage.setItem(key,JSON.stringify(state))},[state,loaded])
 useEffect(()=>{if(screen!=='study')setDetailOpen(false)},[screen])
 const dark=state.settings.theme==='dark'||(state.settings.theme==='system'&&systemDark),c=dark?palettes.dark:palettes.light
 const plan=useMemo(()=>getPlan(state),[state]),current=WORDS.find(w=>w.id===currentId),detail=current?WORD_DETAILS[current.id]:undefined,learned=Object.keys(state.progress).length,mastered=Object.values(state.progress).filter(p=>p.mastered).length,todayDone=state.settings.completedDate===todayKey()?state.settings.completedIds.length:0
 const pref=(k:keyof State['settings'],v:any)=>setState(s=>({...s,settings:{...s.settings,[k]:v}}))
 const say=(text:string)=>{Speech.stop();Speech.speak(text,{language:state.settings.accent==='uk'?'en-GB':'en-US',rate:.88})}
 const options=useMemo(()=>{if(!current)return[];const rest=WORDS.filter(w=>w.id!==current.id);let seed=[...current.id].reduce((n,x)=>(n*33+x.charCodeAt(0))>>>0,9),picked=[];while(rest.length&&picked.length<3){seed=(seed*1664525+1013904223)>>>0;picked.push(rest.splice(seed%rest.length,1)[0])}return[current,...picked].sort((a,b)=>{const h=(x:string)=>[...x].reduce((n,z)=>(n*31+z.charCodeAt(0))>>>0,0);return h(String(current.id)+a.id)-h(String(current.id)+b.id)})},[currentId])
 const begin=(kind:Exclude<Session,null>)=>{const p=getPlan(state),arr=kind==='new'?p.newWords:kind==='review'?p.reviews:WORDS.filter(w=>w.book===state.settings.book).sort(()=>Math.random()-.5),ids=arr.map(w=>w.id);setSession(kind);setQueue(ids);setCurrentId(ids[0]||null);setAnswer(null);setRated(false);setDetailOpen(false);setDetailTab('collocations');setStudyMenuOpen(false);setSpellingInput('');setSpellingResult(null);setScreen('study')}
 useEffect(()=>{if(session==='new'&&current)say(current.word)},[currentId,session])
 const correctIndex=options.findIndex(w=>w.id===current?.id)
 const recordAnswer=(correct:boolean)=>{if(!currentId||rated)return;const rating:Rating=correct?(session==='new'?'fuzzy':'known'):'forgot';setState(s=>rateWord(s,currentId,rating));setRated(true)}
 const choose=(idx:number)=>{if(answer!==null||!current)return;setAnswer(idx);recordAnswer(idx===correctIndex);say(idx===correctIndex?current.word:options[idx].word)}
 const mark=(rating:Rating)=>{if(!currentId||rated)return;setState(s=>rateWord(s,currentId,rating));setRated(true)}
 const continueToDetail=()=>{if(answer===null)return;setDetailTab('collocations');setDetailOpen(true)}
 const next=()=>{const rest=queue.slice(1);setQueue(rest);setCurrentId(rest[0]||null);setAnswer(null);setRated(false);setDetailOpen(false);setSpellingInput('');setSpellingResult(null);setDetailTab('collocations');if(!rest.length){setSession(null);setScreen('home')}}
 const star=(id:string)=>setState(s=>({...s,starred:s.starred.includes(id)?s.starred.filter(x=>x!==id):[...s.starred,id]}))
 const body=(content:React.ReactNode)=><SafeAreaView style={[s.safe,{backgroundColor:c.bg}]}><StatusBar barStyle={dark?'light-content':'dark-content'}/><View style={s.header}><TouchableOpacity onPress={()=>screen!=='home'&&setScreen('home')}><Text style={[s.brand,{color:c.ink}]}>easyword<Text style={{color:c.green}}>.</Text></Text></TouchableOpacity><View style={s.row}>{screen==='study'?<View style={s.headerActionWrap}><TouchableOpacity style={[s.book,{backgroundColor:c.card,borderColor:c.line}]} onPress={()=>setStudyMenuOpen(v=>!v)}><Text style={{color:c.ink}}>更多　⌄</Text></TouchableOpacity>{studyMenuOpen&&<View style={[s.moreMenu,{backgroundColor:c.card,borderColor:c.line}]}>{(['normal','spelling','picture'] as StudyMode[]).map(mode=><TouchableOpacity key={mode} onPress={()=>{setStudyMode(mode);setStudyMenuOpen(false);setAnswer(null);setRated(false);setSpellingInput('');setSpellingResult(null)}} style={[s.moreMenuItem,studyMode===mode&&{backgroundColor:c.pale}]}><Text style={{color:c.ink,fontWeight:studyMode===mode?'700':'500'}}>{mode==='normal'?'默认模式':mode==='spelling'?'拼写模式':'图文模式'}</Text></TouchableOpacity>)}</View>}</View>:<TouchableOpacity style={[s.book,{backgroundColor:c.card,borderColor:c.line}]} onPress={()=>pref('book',state.settings.book==='cet4'?'cet6':'cet4')}><Text style={{color:c.ink}}>{state.settings.book==='cet4'?'四级 CET-4':'六级 CET-6'}　⌄</Text></TouchableOpacity>}<TouchableOpacity style={[s.theme,{backgroundColor:c.card}]} onPress={()=>pref('theme',state.settings.theme==='light'?'dark':state.settings.theme==='dark'?'system':'light')}><Text style={{color:c.ink}}>◐</Text></TouchableOpacity></View></View>{content}{screen==='home'&&<View style={[s.nav,{backgroundColor:c.card,borderColor:c.line}]}>{(['today','learn','me'] as Tab[]).map((t,i)=><TouchableOpacity key={t} style={s.navItem} onPress={()=>{setTab(t);setScreen('home')}}><Text style={{fontSize:18,color:tab===t?c.green:c.muted}}>{['◷','▤','◒'][i]}</Text><Text style={{fontSize:10,color:tab===t?c.green:c.muted}}>{['今日','学习','我的'][i]}</Text></TouchableOpacity>)}</View>}</SafeAreaView>
 const heading=(eyebrow:string,title:string,sub:string)=><><Text style={[s.eyebrow,{color:c.green}]}>{eyebrow}</Text><Text style={[s.title,{color:c.ink}]}>{title}</Text><Text style={[s.sub,{color:c.muted}]}>{sub}</Text></>
 const stats=(items:any[])=><View style={[s.stats,{backgroundColor:c.card,borderColor:c.line}]}>{items.map(([n,l])=><View key={l} style={s.stat}><Text style={[s.statNum,{color:c.ink}]}>{n}</Text><Text style={{fontSize:10,color:c.muted}}>{l}</Text></View>)}</View>
 const chip=(label:string,fn:()=>void,active=false)=><TouchableOpacity onPress={fn} style={[s.chip,{backgroundColor:active?c.pale:c.card,borderColor:c.line}]}><Text style={{color:active?c.green:c.ink}}>{label}</Text></TouchableOpacity>
 if(!loaded)return body(<View/> )
 if(screen==='study'&&detailOpen&&current)return body(
  <ScrollView contentContainerStyle={s.content}>
   <Text style={[s.eyebrow,{color:c.green}]}>单词详情　·　{queue.length} 个待学</Text>
   <View style={[s.card,{backgroundColor:c.card,borderColor:c.line}]}>
    <View style={s.detailWordRow}>
     <View style={{flex:1}}>
      <Text style={[s.word,{color:c.ink}]}>{current.word}</Text>
      <View style={[s.row,{marginTop:4}]}>
       <Text style={{color:c.muted}}>{current.phonetic}</Text>
       <View style={{backgroundColor:c.pale,borderRadius:7,paddingHorizontal:7,paddingVertical:3}}><Text style={{color:c.green,fontSize:11,fontWeight:'700'}}>{state.settings.accent==='us'?'美':'英'}</Text></View>
      </View>
     </View>
     <TouchableOpacity onPress={()=>star(current.id)}><Text style={{color:state.starred.includes(current.id)?c.orange:c.muted,fontSize:26}}>{state.starred.includes(current.id)?'★':'☆'}</Text></TouchableOpacity>
    </View>
    <Text style={[s.section,{color:c.ink}]}>全部释义</Text>
    {(detail?.meanings||[{partOfSpeech:current.partOfSpeech,text:current.meaning,highFrequency:true}]).map((meaning,index)=>
     <View key={`${meaning.partOfSpeech}-${index}`} style={s.meaningRow}>
      <Text style={{color:c.green,fontWeight:'700',width:48}}>{meaning.partOfSpeech}</Text>
      <Text style={{color:c.ink,flex:1,fontWeight:meaning.highFrequency?'700':'400'}}>{meaning.text}</Text>
      {meaning.highFrequency&&<Text style={[s.frequencyTag,{color:c.orange,backgroundColor:c.pale}]}>高频考义</Text>}
     </View>
    )}
    <Text style={[s.section,{color:c.ink}]}>例句</Text>
    {(detail?.examples||[{sentence:current.example,translation:current.translation}]).map((example,index)=>
     <View key={`${current.id}-example-${index}`} style={[s.detailExample,{backgroundColor:c.pale}]}>
      <View style={s.detailExampleHead}>
       <Text style={[s.example,{color:c.ink,flex:1,marginTop:0}]}>{example.sentence}</Text>
       <TouchableOpacity onPress={()=>say(example.sentence)} style={[s.playExample,{borderColor:c.line,backgroundColor:c.card}]}><Text style={{color:c.green}}>◖))</Text></TouchableOpacity>
      </View>
      <Text style={{color:c.muted,fontSize:12,lineHeight:19,marginTop:7}}>{example.translation}</Text>
     </View>
    )}
   </View>
   <View style={s.detailTabs}>
    {([{key:'collocations',label:'词组'},{key:'derivatives',label:'派生词'},{key:'synonyms',label:'近义词'},{key:'confusables',label:'形近词'}] as {key:DetailTab;label:string}[]).map(item=>
     <TouchableOpacity key={item.key} onPress={()=>setDetailTab(item.key)} style={[s.detailTab,{backgroundColor:detailTab===item.key?c.green:c.card,borderColor:detailTab===item.key?c.green:c.line}]}>
      <Text style={{color:detailTab===item.key?'#fff':c.ink,fontSize:12,fontWeight:detailTab===item.key?'700':'500'}}>{item.label}</Text>
     </TouchableOpacity>
    )}
   </View>
   <View style={[s.detailList,{backgroundColor:c.card,borderColor:c.line}]}>
    {detailTab==='collocations'&&(detail?.collocations||[]).map((item,index)=>
     <View key={`${item.phrase}-${index}`} style={s.detailItem}>
      <Text style={{color:c.ink,fontWeight:'700',fontSize:15}}>{item.phrase}<Text style={{color:c.muted,fontWeight:'400'}}>　{item.meaning}</Text></Text>
      <View style={[s.detailExampleHead,{marginTop:9}]}>
       <Text style={[s.example,{color:c.ink,flex:1,marginTop:0}]}>{item.example}</Text>
       <TouchableOpacity onPress={()=>say(item.example)} style={[s.playExample,{borderColor:c.line,backgroundColor:c.pale}]}><Text style={{color:c.green}}>◖))</Text></TouchableOpacity>
      </View>
      <Text style={{color:c.muted,fontSize:12,lineHeight:19,marginTop:4}}>{item.translation}</Text>
     </View>
    )}
    {detailTab==='derivatives'&&(detail?.derivatives||[]).map((item,index)=>
     <View key={`${item.word}-${index}`} style={s.detailItem}><Text style={{color:c.green,fontWeight:'700'}}>{item.word}<Text style={{color:c.muted,fontWeight:'500'}}>　{item.partOfSpeech}</Text></Text><Text style={{color:c.ink,marginTop:5}}>{item.meaning}</Text></View>
    )}
    {detailTab==='synonyms'&&(detail?.synonyms||[]).map((item,index)=>
     <View key={`${item}-${index}`} style={s.detailItem}><Text style={{color:c.ink}}>{item}</Text></View>
    )}
    {detailTab==='confusables'&&(detail?.confusables||[]).map((item,index)=>
     <View key={`${item.word}-${index}`} style={s.detailItem}><Text style={{color:c.green,fontWeight:'700'}}>{item.word}</Text><Text style={{color:c.ink,marginTop:5}}>{item.meaning}</Text></View>
    )}
   </View>
   <TouchableOpacity onPress={next} style={[s.primary,{backgroundColor:c.green,marginTop:16}]}><Text style={s.primaryText}>{queue.length>1?'下一个单词 →':'完成学习 ✓'}</Text></TouchableOpacity>
  </ScrollView>
 )
 if(screen==='study')return body(
  <ScrollView contentContainerStyle={s.content}>
   {current?<><View style={s.studyHead}>
    <Text style={[s.eyebrow,{color:c.green}]}>{session==='new'?'今日新词':session==='review'?'复习旧词':'沉浸速刷'}　·　{queue.length} 个待学</Text>
    <TouchableOpacity onPress={()=>star(current.id)}><Text style={{color:state.starred.includes(current.id)?c.orange:c.muted,fontSize:26}}>{state.starred.includes(current.id)?'★':'☆'}</Text></TouchableOpacity>
   </View>
   <View style={[s.card,{backgroundColor:c.card,borderColor:c.line}]}>
    {studyMode==='spelling'
     ? <Text style={[s.word,{color:c.ink}]}>拼写单词</Text>
     : <Text style={[s.word,{color:c.ink}]}>{current.word}</Text>}
    <View style={[s.row,{marginTop:4}]}>
     <Text style={{color:c.muted}}>{current.phonetic}</Text>
     <View style={{backgroundColor:c.pale,borderRadius:7,paddingHorizontal:7,paddingVertical:3}}>
      <Text style={{color:c.green,fontSize:11,fontWeight:'700'}}>{state.settings.accent==='us'?'美':'英'}</Text>
     </View>
    </View>
    {studyMode==='picture'&&<View style={[s.picturePanel,{backgroundColor:c.pale,borderColor:c.line}]}>
     <Text style={{fontSize:48}}>{wordIllustrations[current.id]||'🖼️'}</Text>
     <Text style={[s.caption,{color:c.green,marginTop:10}]}>图文记忆</Text>
     <Text style={{color:c.ink,fontSize:18,fontWeight:'700',marginTop:8}}>{current.word}</Text>
     <Text style={{color:c.muted,marginTop:4}}>{current.meaning}</Text>
    </View>}
    {session==='new'&&studyMode==='normal'&&<View style={[s.exampleBox,{backgroundColor:c.pale}]}> 
     <Text style={[s.caption,{color:c.green}]}>新词例句</Text>
     <Text style={[s.example,{color:c.ink}]}>{current.example}</Text>
     <Text style={{color:c.muted,fontSize:12,marginTop:5}}>{current.translation}</Text>
    </View>}
    {studyMode==='spelling'?<>
     <View style={[s.spellingBox,{backgroundColor:c.pale,borderColor:c.line}]}>
      <Text style={[s.caption,{color:c.green}]}>听发音，输入单词拼写</Text>
      <TextInput value={spellingInput} editable={answer===null} onChangeText={setSpellingInput} placeholder="输入单词" placeholderTextColor={c.muted} autoCapitalize="none" autoCorrect={false} style={[s.spellInput,{color:c.ink,backgroundColor:c.card,borderColor:c.line}]} />
      {answer===null&&<TouchableOpacity onPress={()=>{const ok=spellingInput.trim().toLowerCase()===current.word.toLowerCase();const wrongIndex=options.findIndex(w=>w.id!==current.id);setSpellingResult(ok);setAnswer(ok?correctIndex:wrongIndex);recordAnswer(ok);if(ok)say(current.word)}} style={[s.spellButton,{backgroundColor:c.green}]}><Text style={{color:'white',fontWeight:'700'}}>检查拼写</Text></TouchableOpacity>}
      {spellingResult===true&&<Text style={{color:c.green,fontWeight:'700',marginTop:8}}>正确！{current.word}</Text>}
      {spellingResult===false&&<Text style={{color:c.red,fontWeight:'700',marginTop:8}}>还不正确</Text>}
     </View>
    </>:<>
     <Text style={[s.caption,{color:c.muted,marginTop:20}]}>选择「{current.word}」的意思</Text>
     {options.map((w,i)=><TouchableOpacity key={w.id} onPress={()=>choose(i)} style={[s.option,{backgroundColor:answer===i?(i===correctIndex?c.pale:c.softRed):c.bg,borderColor:answer===i?(i===correctIndex?c.green:c.red):c.line}]}>
      <Text style={{color:answer===i&&i!==correctIndex?c.red:c.ink,flex:1}}><Text style={{fontWeight:'700'}}>{w.partOfSpeech} </Text>{w.meaning}</Text>
      {answer===i&&i!==correctIndex&&<Text style={{color:c.red,fontWeight:'700'}}>{w.word}　✕</Text>}
      {answer===i&&i===correctIndex&&<Text style={{color:c.green}}>正确　✓</Text>}
     </TouchableOpacity>)}
    </>}
    {answer!==null&&<View style={[s.feedback,{backgroundColor:c.pale,borderRadius:12,padding:12,marginTop:16}]}>
     <Text style={{color:answer===correctIndex?c.green:c.red,fontWeight:'700'}}>{answer===correctIndex?'答对了，很棒！':`正确答案：${current.word}`}</Text>
     {answer!==correctIndex&&<View style={{marginTop:8,gap:7}}>
      <Text style={{color:c.muted,fontSize:12,fontWeight:'700'}}>四个选项的释义</Text>
      {options.map(w=><Text key={w.id} style={{color:c.ink,lineHeight:20}}><Text style={{fontWeight:'700'}}>{w.word}　{w.partOfSpeech}</Text> {w.meaning}</Text>)}
     </View>}
    </View>}
   </View>
   <View style={s.studyActions}>
    <TouchableOpacity onPress={()=>say(current.word)} style={[s.speaker,{backgroundColor:c.card,borderColor:c.line}]}><Text style={{color:c.green,fontSize:18}}>◖))</Text></TouchableOpacity>
    {answer!==null&&<TouchableOpacity onPress={continueToDetail} style={[s.primary,{backgroundColor:c.green,flex:1,marginTop:0}]}><Text style={s.primaryText}>继续</Text></TouchableOpacity>}
   </View>
   </>:<View style={[s.card,{backgroundColor:c.card,borderColor:c.line}]}>
    <Text style={[s.title,{color:c.ink}]}>这一组完成了</Text>
    <Text style={{color:c.muted,marginTop:9}}>今天做得很好，可以稍后继续。</Text>
    <TouchableOpacity style={[s.primary,{backgroundColor:c.green}]} onPress={()=>{setScreen('home');setSession(null)}}><Text style={s.primaryText}>回到首页</Text></TouchableOpacity>
   </View>}
  </ScrollView>
 )
 if(tab==='today')return body(<ScrollView contentContainerStyle={s.content}>{heading('TODAY · '+new Date().toLocaleDateString('zh-CN',{weekday:'long'}),new Date().toLocaleDateString('zh-CN',{month:'long',day:'numeric'}),'把今天的学习，拆成轻松的两步。')}{stats([[plan.newWords.length,'今日新词'],[plan.reviews.length,'待复习'],[todayDone,'已完成']])}<View style={s.split}><TouchableOpacity onPress={()=>begin('new')} style={[s.dayCard,{backgroundColor:c.card,borderColor:c.line}]}><Text style={[s.kicker,{color:c.green}]}>NEW WORDS</Text><Text style={[s.dayNum,{color:c.ink}]}>{plan.newWords.length}</Text><Text style={[s.dayLabel,{color:c.muted}]}>今天要学习的单词</Text><Text style={[s.link,{color:c.green}]}>开始学习　→</Text></TouchableOpacity><TouchableOpacity onPress={()=>begin('review')} style={[s.dayCard,{backgroundColor:c.card,borderColor:c.line}]}><Text style={[s.kicker,{color:c.orange}]}>REVIEW</Text><Text style={[s.dayNum,{color:c.ink}]}>{plan.reviews.length}</Text><Text style={[s.dayLabel,{color:c.muted}]}>今天要复习的单词</Text><Text style={[s.link,{color:c.orange}]}>开始复习　→</Text></TouchableOpacity></View><View style={[s.plan,{backgroundColor:c.pale}]}><Text style={[s.planTitle,{color:c.ink}]}>学习节奏</Text><Text style={[s.muted,{color:c.muted}]}>每日新词 {state.settings.newDaily} 个　·　每日复习 {state.settings.reviewDaily} 个</Text><TouchableOpacity onPress={()=>setTab('me')}><Text style={[s.link,{color:c.green}]}>调整计划与偏好　↗</Text></TouchableOpacity></View></ScrollView>)
 if(tab==='learn')return body(<ScrollView contentContainerStyle={s.content}>{heading('YOUR STUDY TOOLS','想怎么学？','选择一种方式，继续和单词相处。')}<View style={s.tools}>{[['随身听','让单词和例句陪伴你'],['拼写','听音写词，练习拼写'],['单词本','星标收藏，随时复习'],['句子库','收藏例句，学习语境'],['笔记','记录自己的记忆线索'],['听写','连续听写，检查掌握'],['在学词书','当前词书学习进度'],['全部记录','回看每一个学过的词'],['速刷','乱序沉浸式刷已选词书']].map(([name,desc])=><TouchableOpacity key={name} onPress={()=>{setScreen(name);if(name==='速刷')begin('rapid')}} style={[s.tool,{backgroundColor:c.card,borderColor:c.line}]}><Text style={[s.toolTitle,{color:c.ink}]}>{name}<Text style={{color:c.green}}>　→</Text></Text><Text style={[s.muted,{color:c.muted}]}>{desc}</Text></TouchableOpacity>)}</View></ScrollView>)
 if(tab==='me')return body(<ScrollView contentContainerStyle={s.content}>{heading('YOUR SPACE','我的学习','学习偏好、词书和长期记录。')}{stats([[learned,'累计学过'],[mastered,'已掌握'],[state.settings.streak,'连续天数']])}<Text style={[s.section,{color:c.ink}]}>每日计划</Text><Text style={[s.label,{color:c.muted}]}>新学单词 / 天</Text><TextInput keyboardType="number-pad" value={String(state.settings.newDaily)} onChangeText={v=>pref('newDaily',Math.max(1,Math.min(100,Number(v)||1)))} style={[s.input,{color:c.ink,backgroundColor:c.card,borderColor:c.line}]}/><Text style={[s.label,{color:c.muted}]}>复习单词 / 天</Text><TextInput keyboardType="number-pad" value={String(state.settings.reviewDaily)} onChangeText={v=>pref('reviewDaily',Math.max(0,Math.min(200,Number(v)||0)))} style={[s.input,{color:c.ink,backgroundColor:c.card,borderColor:c.line}]}/><Text style={[s.section,{color:c.ink}]}>发音与外观</Text><View style={s.row}>{chip('美式 · US',()=>pref('accent','us'),state.settings.accent==='us')}{chip('英式 · UK',()=>pref('accent','uk'),state.settings.accent==='uk')}</View><View style={s.row}>{(['system','light','dark'] as const).map((v,i)=>chip(['跟随系统','白日模式','黑暗模式'][i],()=>pref('theme',v),state.settings.theme===v))}</View><Text style={[s.section,{color:c.ink}]}>词书　{state.settings.book==='cet4'?'大学英语四级 CET-4':'大学英语六级 CET-6'}</Text><Text style={[s.muted,{color:c.muted}]}>顶部可以切换词书。学过的进度按单词保存，不会因切换而丢失。</Text></ScrollView>)
 const filtered=WORDS.filter(w=>(w.word+' '+w.meaning).toLowerCase().includes(search.toLowerCase())&&(screen!=='单词本'||state.starred.includes(w.id))&&(screen!=='在学词书'||w.book===state.settings.book)&&(screen!=='全部记录'||!!state.progress[w.id]))
 return body(<ScrollView contentContainerStyle={s.content}>{heading('LEARNING LIBRARY',screen,screen==='句子库'?'收藏的例句会出现在这里。':'整理、搜索和继续学习。')}{screen==='笔记'&&<TextInput value={note} onChangeText={setNote} multiline placeholder="记录单词记忆线索……" placeholderTextColor={c.muted} style={[s.input,{height:130,textAlignVertical:'top',color:c.ink,backgroundColor:c.card,borderColor:c.line}]}/ >}{screen==='句子库'&&state.starred.map(id=>{const w=WORDS.find(x=>x.id===id);return w?<TouchableOpacity key={id} style={[s.list,{backgroundColor:c.card,borderColor:c.line}]} onPress={()=>say(w.example)}><Text style={{color:c.ink,flex:1}}>{w.example}</Text><Text onPress={()=>toggleStar(id)} style={{color:c.orange}}>★</Text></TouchableOpacity>:null})}{screen!=='句子库'&&<TextInput value={search} onChangeText={setSearch} placeholder="搜索单词或释义" placeholderTextColor={c.muted} style={[s.input,{color:c.ink,backgroundColor:c.card,borderColor:c.line}]}/ >}{filtered.map(w=><View key={w.id} style={[s.list,{backgroundColor:c.card,borderColor:c.line}]}><View style={{flex:1}}><Text style={[s.listWord,{color:c.ink}]}>{w.word}</Text><Text style={{color:c.muted,marginTop:4}}>{w.meaning}　·　{state.progress[w.id]?.mastered?'已掌握':state.progress[w.id]?'学习中':'未学习'}</Text></View><TouchableOpacity onPress={()=>{setCurrentId(w.id);setQueue([w.id]);setSession(state.progress[w.id]?'review':'new');setScreen('study');setAnswer(null)}}><Text style={{color:c.green}}>学习 →</Text></TouchableOpacity><TouchableOpacity onPress={()=>star(w.id)}><Text style={{color:c.orange,fontSize:20,marginLeft:12}}>{state.starred.includes(w.id)?'★':'☆'}</Text></TouchableOpacity></View>)}</ScrollView>)
}
const s=StyleSheet.create({safe:{flex:1},header:{height:58,paddingHorizontal:19,flexDirection:'row',alignItems:'center',justifyContent:'space-between',zIndex:100,elevation:100},brand:{fontSize:22,fontWeight:'800',letterSpacing:-1},row:{flexDirection:'row',alignItems:'center',gap:8,flexWrap:'wrap'},headerActionWrap:{position:'relative',zIndex:110,elevation:110},book:{padding:10,borderRadius:12,borderWidth:1},theme:{width:36,height:36,alignItems:'center',justifyContent:'center',borderRadius:12},moreMenu:{position:'absolute',top:42,right:0,width:150,borderWidth:1,borderRadius:12,padding:6,zIndex:120,elevation:120},moreMenuItem:{paddingVertical:10,paddingHorizontal:12,borderRadius:8},content:{padding:20,paddingTop:23,paddingBottom:110,width:'100%',maxWidth:900,alignSelf:'center'},eyebrow:{fontSize:10,letterSpacing:1.4,fontWeight:'700',marginBottom:12},title:{fontSize:29,fontWeight:'700',letterSpacing:-.8},sub:{fontSize:13,lineHeight:21,marginTop:8,marginBottom:20},stats:{borderWidth:1,borderRadius:17,padding:16,marginBottom:16,flexDirection:'row',justifyContent:'space-around'},stat:{alignItems:'center',gap:5},statNum:{fontSize:24,fontWeight:'700'},split:{flexDirection:'row',gap:10,marginBottom:14},dayCard:{flex:1,borderWidth:1,borderRadius:17,padding:14,minHeight:160},kicker:{fontSize:9,letterSpacing:1,fontWeight:'700'},dayNum:{fontSize:34,fontWeight:'700',marginTop:13},dayLabel:{fontSize:11,marginTop:2},link:{fontSize:12,fontWeight:'700',marginTop:16},plan:{padding:17,borderRadius:17,marginBottom:14},planTitle:{fontSize:16,fontWeight:'700'},muted:{fontSize:12,lineHeight:19,marginTop:7},nav:{position:'absolute',bottom:12,left:16,right:16,height:62,borderRadius:18,borderWidth:1,flexDirection:'row',justifyContent:'space-around',alignItems:'center',elevation:5},navItem:{width:'30%',alignItems:'center',gap:3},studyHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},card:{padding:18,borderWidth:1,borderRadius:19,marginBottom:15},word:{fontSize:38,fontWeight:'700',letterSpacing:-1},detailWordRow:{flexDirection:'row',alignItems:'center'},meaningRow:{flexDirection:'row',alignItems:'center',paddingVertical:9,borderBottomWidth:1,borderBottomColor:'#e5e4dd'},frequencyTag:{fontSize:10,fontWeight:'700',paddingHorizontal:7,paddingVertical:4,borderRadius:7,marginLeft:8},detailExample:{padding:13,borderRadius:12,marginTop:8},detailExampleHead:{flexDirection:'row',alignItems:'center',gap:10},playExample:{width:40,height:40,borderRadius:11,borderWidth:1,alignItems:'center',justifyContent:'center'},detailTabs:{flexDirection:'row',gap:6,marginBottom:10},detailTab:{flex:1,minHeight:40,alignItems:'center',justifyContent:'center',borderWidth:1,borderRadius:10,paddingHorizontal:4},detailList:{borderWidth:1,borderRadius:15,paddingHorizontal:14},detailItem:{paddingVertical:14,borderBottomWidth:1,borderBottomColor:'#e5e4dd'},exampleBox:{padding:14,borderRadius:13,marginTop:18},picturePanel:{padding:16,borderRadius:13,marginTop:18,alignItems:'center'},caption:{fontSize:11,fontWeight:'700'},example:{fontSize:15,lineHeight:23,marginTop:9},option:{borderWidth:1,borderRadius:12,padding:13,marginTop:8,flexDirection:'row',alignItems:'center'},feedback:{marginTop:16,gap:8},chip:{borderWidth:1,paddingVertical:9,paddingHorizontal:12,borderRadius:10,marginTop:8},outline:{borderWidth:1,borderRadius:11,alignItems:'center',padding:13,marginTop:20},studyActions:{flexDirection:'row',gap:8,alignItems:'center'},speaker:{width:48,height:48,borderWidth:1,borderRadius:13,alignItems:'center',justifyContent:'center'},primary:{height:48,borderRadius:12,alignItems:'center',justifyContent:'center',marginTop:15},primaryText:{color:'white',fontSize:14,fontWeight:'700'},tools:{gap:9},tool:{borderWidth:1,borderRadius:15,padding:15},toolTitle:{fontSize:15,fontWeight:'700'},section:{fontSize:16,fontWeight:'700',marginTop:20,marginBottom:8},label:{fontSize:12,marginTop:10,marginBottom:6},input:{borderWidth:1,borderRadius:12,height:46,paddingHorizontal:13,marginBottom:10},spellInput:{borderWidth:1,borderRadius:12,height:46,paddingHorizontal:13,marginTop:10},spellButton:{paddingVertical:11,paddingHorizontal:14,borderRadius:10,marginTop:10,alignItems:'center'},spellingBox:{padding:14,borderRadius:13,marginTop:18,borderWidth:1},list:{borderWidth:1,padding:14,borderRadius:14,marginTop:7,flexDirection:'row',alignItems:'center'},listWord:{fontSize:17,fontWeight:'700'}})
