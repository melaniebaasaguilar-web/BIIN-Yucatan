(()=>{'use strict';
const names=['Izamal','Valladolid','Tekit','Homún','Ticul'],slugs=['izamal','valladolid','tekit','hom_n','ticul'];
const page=location.pathname.split('/').filter(Boolean).at(-2)||'biin_iniciar_sesi_n';
const screen=page==='biin_iniciar_sesi_n'?'login':page==='biin_rutas_de_transporte_yucat_n'?'home':page==='biin_seleccionar_destino'?'search':page.startsWith('biin_detalle_de_ruta_')?'detail':page.startsWith('biin_mi_itinerario_en_')?'itinerary':page==='biin_men_lateral_de_usuario'?'menu':page==='biin_personalizar_itinerario_en_izamal'?'custom':'profile';
const idx=Math.max(0,slugs.indexOf(page.replace(/^biin_detalle_de_ruta_|^biin_mi_itinerario_en_/,'')));
const storage=(k,v)=>{if(arguments.length>1)localStorage.setItem('biin_'+k,JSON.stringify(v));};
const accountKey=k=>{const email=(()=>{try{return JSON.parse(localStorage.getItem('biin_session'))?.email||''}catch{return ''}})();return ['plans','savedRoutes','favorites','completedTrips','visitedTowns'].includes(k)?'biin_user_'+encodeURIComponent(email.toLowerCase())+'_'+k:'biin_'+k};
const get=(k,d)=>{try{return JSON.parse(localStorage.getItem(accountKey(k)))??d}catch{return d}};
const put=(k,v)=>localStorage.setItem(accountKey(k),JSON.stringify(v));
const session=()=>get('session',null);
const dest=(type,n=idx)=>{const paths={custom:'biin_personalizar_itinerario_en_izamal',login:'biin_iniciar_sesi_n',home:'biin_rutas_de_transporte_yucat_n',search:'biin_seleccionar_destino',menu:'biin_men_lateral_de_usuario',profile:'biin_mi_perfil_de_usuario'};return '../'+(paths[type]||(type==='detail'?'biin_detalle_de_ruta_':'biin_mi_itinerario_en_')+slugs[n])+'/code.html'};
const go=(type,n=idx)=>{if(type==='explore'){location.href='../explorar.html';return}if(!session()&&type!=='login'){location.replace(dest('login'));return}location.href=dest(type,n)};
if(screen!=='login'&&!session()){location.replace(dest('login'));return}
// El acceso desde index siempre muestra el formulario de inicio de sesión.
const text=e=>(e?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
const icon=e=>(e?.querySelector('.material-symbols-outlined')?.textContent||'').toLowerCase().trim();
const note=t=>{document.querySelector('.biin-alert')?.remove();let el=document.createElement('div');el.className='biin-alert';el.textContent=t;document.body.append(el);setTimeout(()=>el.remove(),2800)};
function dialog(title,fields,onSave,body=''){let overlay=document.createElement('div');overlay.className='biin-dialog-backdrop';let content=document.createElement('div');content.className='biin-dialog';let h=document.createElement('h2');h.textContent=title;content.append(h);if(body){let p=document.createElement('p');p.textContent=body;content.append(p)}let inputs={};fields.forEach(f=>{let l=document.createElement('label');l.textContent=f.label;let i=document.createElement('input');i.type=f.type||'text';i.placeholder=f.label;i.value=f.value||'';i.required=true;inputs[f.key]=i;content.append(l,i)});let actions=document.createElement('div');actions.className='biin-dialog-actions';let cancel=document.createElement('button');cancel.className='biin-muted';cancel.textContent='Cancelar';cancel.onclick=()=>overlay.remove();let save=document.createElement('button');save.textContent='Continuar';save.onclick=()=>{let values=Object.fromEntries(Object.entries(inputs).map(([k,v])=>[k,v.value.trim()]));if(Object.values(values).some(v=>!v)){note('Completa todos los campos');return}if(onSave(values)!==false)overlay.remove()};actions.append(cancel,save);content.append(actions);overlay.append(content);overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()});document.body.append(overlay)}
function side(){let o=document.createElement('div');o.className='biin-side';let s=document.createElement('section');s.innerHTML='<button class="biin-close" aria-label="Cerrar">×</button><h2>BIIN</h2><p>Tu guía para viajar por Yucatán</p>';let options=[['home','Inicio / mapa'],['search','Explorar rutas'],['saved','Rutas guardadas'],['explore','Explorar Yucatán'],['itinerary','Mi viaje'],['profile','Mi perfil'],['logout','Cerrar sesión']];options.forEach(([k,label])=>{let b=document.createElement('button');b.textContent=label;b.onclick=()=>{if(k==='logout')logout();else if(k==='saved')savedDialog();else if(k==='itinerary')myTrips();else go(k)};s.append(b)});o.append(s);o.onclick=e=>{if(e.target===o||e.target.closest('.biin-close'))o.remove()};document.body.append(o)}
function logout(){put('session',null);location.replace(dest('login')+'#cambiar')}
function savedDialog(){let ids=get('savedRoutes',[]);if(!ids.length){note('Aún no tienes rutas guardadas');return}dialog('Rutas guardadas',[],()=>go('detail',ids[0]),ids.map(i=>'• '+names[i]).join(' · ')+' · Pulsa Continuar para abrir la primera ruta.')}
const nav=document.createElement('nav');if(screen!=='login'){nav.className='biin-bottom-nav';nav.setAttribute('aria-label','Navegación principal');[['home','home','Inicio'],['search','route','Rutas'],['explore','explore','Explorar'],['itinerary','event_note','Mi viaje'],['profile','person','Perfil']].forEach(([type,ic,label])=>{let b=document.createElement('button');b.className=(type===screen||(screen==='detail'&&type==='search')||(screen==='custom'&&type==='itinerary')?'active':'');b.innerHTML='<span class="material-symbols-outlined">'+ic+'</span><span>'+label+'</span>';b.onclick=()=>type==='itinerary'?myTrips():go(type,idx);nav.append(b)});document.body.append(nav);document.body.classList.add('biin-has-nav');}
if(screen==='home')document.body.classList.add('biin-map-view');if(screen==='itinerary')document.body.classList.add('biin-screen-itinerary');
let indi=document.createElement('div');indi.className='biin-demo-indicator';indi.textContent='BIIN';document.body.append(indi);
// Handle clicks early, before embedded design scripts, while keeping their visual structure.
document.addEventListener('click',e=>{const el=e.target.closest('button,a,[role="button"]');if(!el||el.closest('.biin-bottom-nav,.biin-side,.biin-dialog-backdrop'))return;let t=text(el),ic=icon(el),together=t+' '+ic;let action=null;
if(ic==='menu'||t==='menu')action=()=>side();
else if(ic==='arrow_back'||ic==='chevron_left')action=()=>{if(screen==='login')go('login');else if(screen==='itinerary')go('detail');else if(screen==='detail')go('search');else go('home')};
else if(screen==='home'&&/alt_route|\brutas\b|explorar/.test(together))action=()=>go('search');
else if(screen==='home'&&/itinerario/.test(together))action=()=>myTrips();
else if(screen==='detail'&&/hacer mi itinerario|crear itinerario|planear itinerario|itinerario recomendado/.test(together))action=()=>{put('selectedDestination',idx);openPlanner(idx)};
else if(screen==='detail'&&(ic==='favorite_border'||ic==='favorite'))action=()=>{let ids=get('savedRoutes',[]);ids=ids.includes(idx)?ids.filter(i=>i!==idx):[...ids,idx];put('savedRoutes',ids);note(ids.includes(idx)?'Ruta guardada':'Ruta eliminada de guardados')};
else if(screen==='itinerary'&&/guardar offline|bookmark/.test(together))action=()=>{let ids=get('savedItineraries',[]);if(!ids.includes(idx))ids.push(idx);put('savedItineraries',ids);note('Itinerario guardado en este dispositivo')};
else if(screen==='itinerary'&&/personalizar/.test(together))action=()=>openPlanner(idx,'personalizado');
else if(screen==='itinerary'&&/vista en vivo/.test(together))action=()=>go('home');
else if(screen==='itinerary'&&/share/.test(together))action=()=>{navigator.clipboard?.writeText(location.href).then(()=>note('Enlace copiado')).catch(()=>note('Comparte la URL de esta pantalla'))};
else if(screen==='profile'&&/editar perfil/.test(together))action=()=>{let u=session()||{};dialog('Editar perfil',[{key:'name',label:'Nombre',value:u.name||''},{key:'email',label:'Correo electrónico',type:'email',value:u.email||''}],v=>{put('session',v);note('Perfil actualizado')})};
else if(screen==='profile'&&/cerrar sesión/.test(together))action=logout;
else if(screen==='profile'&&/ver ruta/.test(together))action=()=>go('detail',get('selectedDestination',0));
else if(screen==='profile'&&/gestionar/.test(together))action=()=>go('search');
else if(screen==='menu'&&/cerrar sesión/.test(together))action=logout;
else if(screen==='menu'&&/mis rutas|guardados/.test(together))action=savedDialog;
else if(screen==='menu'&&/perfil/.test(together))action=()=>go('profile');
else if(screen==='login'&&/continuar con google/.test(together))action=()=>note('Google no está conectado en esta demostración');
else if(screen==='login'&&/olvidaste/.test(together))action=()=>dialog('Recuperar acceso',[{key:'email',label:'Correo electrónico',type:'email'}],()=>note('Recuperación simulada; no se envía ningún correo'));
if(action){e.preventDefault();e.stopImmediatePropagation();action()}
},true);
if(screen==='login'){
 const form=document.querySelector('form'),ins=[...document.querySelectorAll('input')];let email=ins.find(x=>x.type==='email'||x.type==='text'),pass=ins.find(x=>x.type==='password');
 const enter=e=>{e?.preventDefault();e?.stopImmediatePropagation?.();let addr=email?.value?.trim().toLowerCase(), secret=pass?.value||'';if(!addr||!secret){note('Completa correo y contraseña');return}let acc=get('account',null);if(!acc){note('Primero crea tu cuenta');return}if(acc.email.toLowerCase()!==addr||acc.password!==secret){note('Correo o contraseña incorrectos');return}put('session',{name:acc.name,email:acc.email});location.replace(dest('home'))};
 form?.addEventListener('submit',enter,true);
 document.querySelectorAll('button').forEach(b=>{if(/entrar a mi cuenta/.test(text(b)))b.addEventListener('click',enter,true);if(/registrarme/.test(text(b)))b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();dialog('Crear cuenta de prueba',[{key:'name',label:'Nombre'},{key:'email',label:'Correo electrónico',type:'email'},{key:'password',label:'Contraseña',type:'password'}],v=>{if(!/^\S+@\S+\.\S+$/.test(v.email)||v.password.length<4){note('Correo válido y contraseña de al menos 4 caracteres');return false}put('account',v);put('session',{name:v.name,email:v.email});location.replace(dest('home'))})},true)});
}
if(screen==='search'){
 const cards=[...document.querySelectorAll('#routes-container > *')];cards.forEach((card,i)=>{if(i>=names.length)return;card.tabIndex=0;card.setAttribute('role','button');card.style.cursor='pointer';const select=e=>{if(e.target.closest('button')&&e.target.closest('button').matches('[data-biin-no-route]'))return;e.preventDefault();e.stopPropagation();put('selectedDestination',i);go('detail',i)};card.addEventListener('click',select,true);card.addEventListener('keydown',e=>{if(e.key==='Enter')select(e)})});
 const inp=document.querySelector('input');inp?.addEventListener('input',()=>{let q=inp.value.trim().toLocaleLowerCase('es');cards.forEach(c=>c.hidden=!text(c).includes(q))});
 const q=sessionStorage.getItem('biin_search');if(q&&inp){inp.value=q;inp.dispatchEvent(new Event('input'));sessionStorage.removeItem('biin_search')}
}
if(screen==='home'){
 const inp=document.querySelector('input');inp?.addEventListener('keydown',e=>{if(e.key==='Enter'){sessionStorage.setItem('biin_search',inp.value);go('search')}});
}
if(screen==='itinerary')setTimeout(()=>{let area=document.createElement('section');area.className='biin-extra-actions biin-hidden-original-actions';area.innerHTML='<h3>Tu itinerario en '+names[idx]+'</h3><p>Organiza el día a tu manera o usa una propuesta de BIIN.</p><button id="biin-recommended">Generar itinerario recomendado</button><button id="biin-personalized">Crear mi itinerario</button><button id="biin-edit-filters" class="biin-muted">Filtrar lugares y horarios</button><div id="biin-plan-result"></div>';let root=document.querySelector('main')||document.body;root.append(area);area.classList.add('biin-plan-shortcuts');area.querySelector('#biin-recommended').onclick=()=>openPlanner(idx,'recomendado');area.querySelector('#biin-personalized').onclick=()=>openPlanner(idx,'personalizado');area.querySelector('#biin-edit-filters').onclick=()=>openPlanner(idx,'personalizado');showPlan(area.querySelector('#biin-plan-result'),idx);renderOnlySelected();},0);
if(screen==='custom'){let c=document.createElement('section');c.className='biin-extra-actions';c.innerHTML='<h3>Horario de tu viaje</h3><label>Fecha <input id="biin-date" type="date" required></label><label>Hora de inicio <input id="biin-start" type="time" value="09:00" required></label><label>Horas disponibles <select id="biin-hours"><option value="2">2 horas</option><option value="4" selected>4 horas</option><option value="6">6 horas</option><option value="8">8 horas</option><option value="12">12 horas</option></select></label><button id="biin-save-custom">Guardar itinerario personalizado</button>';(document.querySelector('main')||document.body).append(c);c.querySelector('#biin-save-custom').onclick=()=>{const date=c.querySelector('#biin-date').value;if(!date){note('Selecciona la fecha');return}put('customItinerary_'+get('selectedDestination',0),{date,start:c.querySelector('#biin-start').value,hours:c.querySelector('#biin-hours').value});note('Itinerario guardado');go('itinerary',get('selectedDestination',0))};}
if(screen==='detail'){put('selectedDestination',idx);}
if(screen==='profile'){renderProfile();const profileMain=document.querySelector('main');if(profileMain){const btn=document.createElement('button');btn.className='biin-profile-trips';btn.textContent='Ver mis itinerarios guardados';btn.onclick=myTrips;profileMain.append(btn)}}

// Functional overlays and interaction for all original Stitch controls.
function extraSheet(title,body,actions=[]){const overlay=document.createElement('div');overlay.className='biin-dialog-backdrop';const sheet=document.createElement('div');sheet.className='biin-dialog';const head=document.createElement('h2');head.textContent=title;sheet.append(head);const content=document.createElement('div');content.className='biin-sheet-content';content.innerHTML=body;sheet.append(content);const footer=document.createElement('div');footer.className='biin-dialog-actions';const close=document.createElement('button');close.textContent='Cerrar';close.className='biin-muted';close.onclick=()=>overlay.remove();footer.append(close);actions.forEach(a=>{const b=document.createElement('button');b.textContent=a.label;b.onclick=()=>{overlay.remove();a.run()};footer.append(b)});sheet.append(footer);overlay.append(sheet);overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.remove()});document.body.append(overlay);return overlay}
const today=()=>new Date().toISOString().slice(0,10);
const selected=()=>get('selectedDestination',0);
const itineraryModes=['Ruta sugerida','Cultural','Gastronomía','Artesanías'];
function savePlan(mode){const destId=screen==='custom'?selected():idx;let plans=get('plans',[]);const plan={dest:destId,mode,created:today()};plans=plans.filter(p=>p.dest!==destId);plans.push(plan);put('plans',plans);note('Plan guardado');}
if(screen==='login'){
 const all=[...document.querySelectorAll('button')];
 let reg=all.find(b=>/registrarme/i.test(text(b)));
 let tab=all.find(b=>/iniciar sesi[oó]n/i.test(text(b)));

 if(tab)tab.addEventListener('click',()=>{document.querySelector('#identifier')?.focus()});
 const reveal=all.find(b=>/mostrar/i.test(text(b)));
 if(reveal)reveal.onclick=()=>{const p=document.querySelector('#password');if(p){p.type=p.type==='password'?'text':'password';reveal.textContent=p.type==='password'?'Mostrar':'Ocultar'}};
}
if(screen==='home'){
 let zoom=1;
 const buttons=[...document.querySelectorAll('button')];
 buttons.forEach(b=>{const t=text(b);if(/^(add|remove)$/.test(t)){b.onclick=()=>{zoom=Math.max(.8,Math.min(1.5,zoom+(t==='add'?.15:-.15)));const map=document.querySelector('iframe,.map-container,[id*="map"]');if(map)map.style.transform=`scale(${zoom})`;note(t==='add'?'Acercando mapa':'Alejando mapa')};}
 if(t==='my_location')b.onclick=()=>extraSheet('Tu ubicación','<p>📍 Ubicación del usuario representada por la marquesita en el mapa.</p>');
 if(t==='layers')b.onclick=()=>extraSheet('Capas del mapa','<p>Visualización de paradas y recorridos.</p>',[{label:'Ver rutas',run:()=>go('search')}]);
 if(/ver horarios/.test(t))b.onclick=()=>go('search');
 if(t==='close')b.onclick=()=>b.closest('.absolute,.fixed')?.classList.add('hidden');
 });
}
if(screen==='search'){
 const bar=document.querySelector('#routes-container');
 const cards=bar?[...bar.children].filter(el=>el.querySelector('button,a')||el.textContent.trim().length>45).slice(0,5):[];
 const chips=[...document.querySelectorAll('button')].filter(b=>/todas las rutas|directos|ruta cenotes/i.test(text(b)));
 let mode='all';
 const apply=()=>{
  const q=(document.querySelector('#route-search-input')?.value||'').trim().toLocaleLowerCase('es');
  cards.forEach((c,i)=>{const match=(mode==='all'||(mode==='directos'&&[0,1,2,4].includes(i))||(mode==='cenotes'&&[1,3].includes(i)))&&text(c).includes(q);c.style.setProperty('display',match?'':'none','important');c.hidden=!match;});
  const none=document.getElementById('biin-no-match');if(none)none.hidden=cards.some(c=>!c.hidden);
 };
 chips.forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const t=text(b);mode=t.includes('cenotes')?'cenotes':t.includes('directos')?'directos':'all';chips.forEach(x=>x.classList.toggle('biin-filter-active',x===b));apply()},true));
 const input=document.getElementById('route-search-input');input?.addEventListener('input',apply);
 if(bar){const e=document.createElement('p');e.id='biin-no-match';e.textContent='No se encontraron rutas para esa búsqueda.';e.hidden=true;e.style.cssText='padding:18px;text-align:center;color:#6f5446';bar.append(e)}
 apply();
}

if(screen==='detail'){
 document.querySelectorAll('button').forEach(b=>{const t=text(b);if(/medio día|día completo|tarde mágica|tour de compras|tour fotográfico|ruta textil/.test(t)){b.addEventListener('click',e=>{e.preventDefault();document.querySelectorAll('.biin-selected-option').forEach(x=>x.classList.remove('biin-selected-option'));b.classList.add('biin-selected-option');put('routeChoice_'+idx,t);note('Duración seleccionada: '+t)},true)}});
}
if(screen==='itinerary'){
 // The selected itinerary is rendered from saved choices, never from sample data.
}
if(screen==='custom'){
 const realSave=[...document.querySelectorAll('button')].find(b=>/generar y guardar mi itinerario/.test(text(b)));
 if(realSave)realSave.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();const date=document.querySelector('#biin-date')?.value||today();const time=document.querySelector('#biin-start')?.value||'09:00';const hours=document.querySelector('#biin-hours')?.value||'4';put('customItinerary_'+selected(),{date,start:time,hours});savePlan('Personalizado');go('itinerary',selected())},true);
}
if(screen==='profile'){
 document.querySelectorAll('button').forEach(b=>{const t=text(b);if(/preferencias de viaje/.test(t))b.onclick=()=>dialog('Preferencias de viaje',[{key:'style',label:'Tipo de recorrido favorito',value:get('style','Cultural')}],v=>{put('style',v.style);note('Preferencias guardadas')});if(/centro de asistencia/.test(t))b.onclick=()=>extraSheet('Centro de ayuda','<p>En BIIN puedes buscar rutas, guardar destinos y crear planes de viaje.</p>')});
}
if(screen==='menu'){
 const items=[...document.querySelectorAll('button, [role="button"]')];items.forEach(b=>{let t=text(b);if(/chevron_right/.test(t))b.onclick=()=>go('profile')});
}
// Clickable look and keyboard access for informational stop cards, chips, and menus.
document.querySelectorAll('[role="button"]').forEach(x=>{if(x.tagName!=='BUTTON'&&!x.hasAttribute('tabindex'))x.tabIndex=0});

// Planificador conservando el estilo de las pantallas Stitch.
const locations={
 Izamal:['Centro histórico','Convento de San Antonio de Padua','Mercado municipal','Paseo por las calles amarillas','Pirámide Kinich Kakmó'],
 Valladolid:['Centro histórico','Calzada de los Frailes','Cenote Zací','Convento de San Bernardino'],
 Tekit:['Centro de Tekit','Talleres de guayaberas','Mercado local'],
 Homún:['Centro de Homún','Cenote Santa Rosa','Cenote Tza Ujun Kat','Comida local'],
 Ticul:['Centro de Ticul','Talleres de alfarería','Mercado de Ticul']
};
const catalogPlaces={
 'Centro histórico':{category:'Cultura',duration:55,info:'Recorre la plaza principal y descubre las calles que conservan la vida cotidiana y el patrimonio de la localidad.'},
 'Convento de San Antonio de Padua':{category:'Cultura',duration:65,info:'Fundado en el siglo XVI sobre una antigua plataforma maya, es uno de los grandes símbolos de Izamal. Sus arcadas y su amplio atrio cuentan parte de la historia franciscana de Yucatán.'},
 'Mercado municipal':{category:'Gastronomía',duration:45,info:'Una parada para conocer sabores y productos locales, conversar con comerciantes y explorar la cocina cotidiana de Yucatán.'},
 'Paseo por las calles amarillas':{category:'Cultura',duration:40,info:'Las fachadas amarillas y blancas son parte de la identidad de Izamal, conocida como la Ciudad de las Tres Culturas por su herencia maya, colonial y contemporánea.'},
 'Pirámide Kinich Kakmó':{category:'Cultura',duration:60,info:'Este gran vestigio prehispánico recuerda la importancia ceremonial que alcanzó Izamal en época maya; su nombre se relaciona con una deidad solar.'},
 'Calzada de los Frailes':{category:'Cultura',duration:55,info:'Una de las calles tradicionales de Valladolid, con fachadas de colores y una ruta peatonal hacia el barrio de Sisal.'},
 'Cenote Zací':{category:'Naturaleza',duration:65,info:'Cenote urbano de Valladolid, asociado al paisaje natural de la península y a la historia de sus asentamientos.'},
 'Convento de San Bernardino':{category:'Cultura',duration:55,info:'Conjunto religioso franciscano del siglo XVI en el barrio de Sisal, una parada para apreciar la arquitectura histórica de Valladolid.'},
 'Centro de Tekit':{category:'Cultura',duration:45,info:'Un paseo por la plaza y las calles del municipio, reconocido por su tradición de confección de guayaberas.'},
 'Talleres de guayaberas':{category:'Artesanías',duration:65,info:'Conoce el trabajo textil de los talleres de Tekit y los detalles que distinguen la confección de guayaberas.'},
 'Mercado local':{category:'Gastronomía',duration:45,info:'Explora ingredientes, antojitos y productos habituales de la región.'},
 'Centro de Homún':{category:'Cultura',duration:40,info:'El pueblo es punto de partida para visitar cenotes y descubrir actividades de las comunidades de la zona.'},
 'Cenote Santa Rosa':{category:'Naturaleza',duration:75,info:'Un cenote de Homún para apreciar los paisajes subterráneos formados en la roca caliza de Yucatán.'},
 'Cenote Tza Ujun Kat':{category:'Naturaleza',duration:75,info:'Uno de los cenotes conocidos de la zona de Homún, parte de su riqueza natural.'},
 'Comida local':{category:'Gastronomía',duration:55,info:'Haz una pausa para descubrir platillos y bebidas de preparación tradicional.'},
 'Centro de Ticul':{category:'Cultura',duration:45,info:'Conoce el corazón de la llamada Perla del Sur, con una vida local ligada al comercio y a sus oficios.'},
 'Talleres de alfarería':{category:'Artesanías',duration:65,info:'Ticul conserva una tradición alfarera que se reconoce en la elaboración de piezas de barro.'},
 'Mercado de Ticul':{category:'Gastronomía',duration:45,info:'Una parada para descubrir productos y comida regional.'}
};
function categoryOf(name){return catalogPlaces[name]?.category||'Cultura'}
function openPlanner(n,mode=''){put('selectedDestination',n);document.querySelector('.biin-dialog-backdrop')?.remove();const place=names[n],opt=locations[place]||[],last=get('plans',[]).find(p=>p.dest===n);let overlay=document.createElement('div');overlay.className='biin-dialog-backdrop';const box=document.createElement('form');box.className='biin-dialog biin-planner';box.innerHTML=`<h2>Planea tu visita a ${place}</h2><p>Elige cómo quieres recorrer los lugares.</p><div class="biin-mode"><label><input type="radio" name="mode" value="recomendado" ${mode!=='personalizado'?'checked':''}> Recomendado por BIIN</label><label><input type="radio" name="mode" value="personalizado" ${mode==='personalizado'?'checked':''}> Crear mi propio itinerario</label></div><label>Fecha de visita<input name="date" type="date" required></label><label>Hora de inicio<input name="start" type="time" value="09:00" required></label><label>¿Cuánto tiempo tienes?<select name="hours"><option value="2">2 horas</option><option value="4" selected>4 horas</option><option value="6">6 horas</option><option value="8">8 horas</option><option value="10">10 horas</option><option value="12">12 horas</option></select></label><label>¿Qué te interesa?<select name="interest"><option value="Todos">De todo un poco</option><option value="Cultura">Cultura e historia</option><option value="Gastronomía">Gastronomía</option><option value="Naturaleza">Naturaleza</option><option value="Artesanías">Artesanías</option></select></label><div class="biin-pick"><strong id="pick-title">Lugares que deseas incluir</strong>${opt.map((a,i)=>`<label><input type="checkbox" name="visit" value="${i}"> ${a}</label>`).join('')}<p id="biin-category-empty"></p></div><p id="biin-mode-help" class="biin-mode-help"></p><div class="biin-dialog-actions"><button type="button" class="biin-muted" id="biin-cancel">Cancelar</button><button type="submit">Generar itinerario</button></div>`;overlay.append(box);document.body.append(overlay);
 box.querySelector('[name="date"]').value=last?.date||new Date().toLocaleDateString('en-CA');box.querySelector('[name="start"]').value=last?.start||'09:00';if(last?.interest)box.querySelector('[name="interest"]').value=last.interest;if(last?.places?.length){box.querySelectorAll('[name="visit"]').forEach(ch=>{ch.checked=last.places.includes(opt[+ch.value])})}if(last?.hours)box.querySelector('[name="hours"]').value=String(last.hours);const choice=get('routeChoice_'+n,'').toLowerCase();if(!last){box.querySelector('[name="hours"]').value=/día completo|dia completo/.test(choice)?'8':/tarde|atardecer/.test(choice)?'2':'4'}
 let modeInput=()=>box.querySelector('[name="mode"]:checked').value;const update=()=>{const isRec=modeInput()==='recomendado',interest=box.querySelector('[name="interest"]').value;box.querySelector('#pick-title').textContent=isRec?'Lugares disponibles para la recomendación':'Marca los lugares que quieres visitar';box.querySelector('#biin-mode-help').textContent=isRec?'BIIN propondrá lugares de acuerdo con tus intereses y el tiempo disponible. Puedes marcar uno o varios si quieres priorizarlos.':'Solo se incluirán los lugares que marques. Si no marcas ninguno, no se creará un itinerario.';let shown=0;box.querySelectorAll('[name="visit"]').forEach(ch=>{let label=ch.closest('label'),name=opt[+ch.value],yes=interest==='Todos'||categoryOf(name)===interest;label.hidden=!yes;label.style.display=yes?'flex':'none';if(!yes)ch.checked=false;if(yes)shown++});box.querySelector('#biin-category-empty').textContent=shown?'':'No hay lugares de esta categoría en este destino.'};box.querySelectorAll('[name="mode"]').forEach(r=>r.addEventListener('change',update));box.querySelector('[name="interest"]').addEventListener('change',update);update();
 box.querySelector('#biin-cancel').onclick=()=>overlay.remove();overlay.onclick=e=>{if(e.target===overlay)overlay.remove()};box.onsubmit=e=>{e.preventDefault();const f=new FormData(box),hours=+f.get('hours'),interest=f.get('interest'),mode=f.get('mode');const checked=[...box.querySelectorAll('[name="visit"]:checked')].map(x=>opt[+x.value]);const eligible=opt.filter(a=>interest==='Todos'||categoryOf(a)===interest);let places=checked;if(mode==='recomendado'&&!places.length){let budget=hours*60,chosen=[];for(const place of eligible){let minutes=catalogPlaces[place]?.duration||45;if(budget>=Math.min(minutes,60)){chosen.push(place);budget-=minutes+10}}places=chosen.length?chosen:eligible.slice(0,1)}if(!places.length){note(mode==='personalizado'?'Marca al menos un lugar para crear tu plan':'No hay lugares para recomendar en este filtro');return}let plan={dest:n,mode,date:f.get('date'),start:f.get('start'),hours,interest,places};put('plans',[...get('plans',[]).filter(x=>x.dest!==n),plan]);overlay.remove();go('itinerary',n)};
}
function showPlan(root,n){
 const plan=get('plans',[]).find(x=>x.dest===n);if(!root)return;root.replaceChildren();
 if(!plan||!Array.isArray(plan.places)||!plan.places.length){root.innerHTML='<div class="biin-plan-summary"><h3>Sin itinerario todavía</h3><p>Elige los lugares que te interesan y configura fecha y hora para construir el recorrido.</p><button type="button" class="biin-empty-create">Crear mi itinerario</button></div>';root.querySelector('button').onclick=()=>openPlanner(n);return;}
 const section=document.createElement('section');section.className='biin-plan-summary biin-rich-plan';
 const heading=document.createElement('h3');heading.textContent=(plan.mode==='recomendado'?'Recorrido recomendado':'Mi recorrido personalizado')+' · '+names[n];section.append(heading);
 const intro=document.createElement('p');intro.textContent=`${plan.date} · ${plan.start} · ${plan.hours} horas · ${plan.places.length} lugares`;section.append(intro);
 const minutesMax=Number(plan.hours)*60;let used=0;let startParts=String(plan.start||'09:00').split(':').map(Number),cursor=startParts[0]*60+startParts[1];
 const visible=plan.places.filter(name=>plan.interest==='Todos'||!plan.interest||categoryOf(name)===plan.interest);
 const filtered=visible.length?visible:[];
 if(!filtered.length){section.insertAdjacentHTML('beforeend','<p>No hay lugares seleccionados para este filtro. Edita tu itinerario para elegir otros.</p>');}
 const clock=min=>`${String(Math.floor(min/60)%24).padStart(2,'0')}:${String(min%60).padStart(2,'0')}`;
 filtered.forEach((name,i)=>{const info=catalogPlaces[name]||{category:'Cultura',duration:45,info:'Conoce los atractivos de esta localidad.'};let remaining=minutesMax-used;if(remaining<=0)return;let stay=Math.min(info.duration||45,remaining);let card=document.createElement('article');card.className='biin-place-card';let stamp=document.createElement('div');stamp.className='biin-place-time';stamp.textContent=`${clock(cursor)} – ${clock(cursor+stay)} · Visita ${i+1} · ${stay} min`;const tag=document.createElement('span');tag.className='biin-place-tag';tag.textContent=info.category;const h4=document.createElement('h4');h4.textContent=name;const p=document.createElement('p');p.textContent=info.info;card.append(stamp,tag,h4,p);section.append(card);cursor+=stay;used+=stay;if(i<filtered.length-1 && used+10<minutesMax){cursor+=10;used+=10;}});
 let actions=document.createElement('div');actions.className='biin-plan-controls';let edit=document.createElement('button');edit.textContent='Cambiar lugares y horarios';edit.onclick=()=>openPlanner(n,plan.mode);let list=document.createElement('button');list.textContent='Mis itinerarios';list.className='biin-muted';list.onclick=myTrips;actions.append(edit,list);section.append(actions);root.append(section);
}
function renderOnlySelected(){if(screen!=='itinerary')return;const main=document.querySelector('main');if(!main)return;// El contenido original de Stitch queda como referencia visual, pero no como recorrido activo.
let oldChildren=[...main.children];let panel=document.createElement('section');panel.className='biin-itinerary-live';panel.innerHTML='<div class="biin-itinerary-head"><button type="button" id="biin-live-back">←</button><div><small>BIIN ESCAPADAS</small><h2>Tu itinerario en '+names[idx]+'</h2></div><button type="button" id="biin-live-edit">Editar</button></div><div id="biin-live-timeline"></div>';main.insertBefore(panel,main.firstChild);panel.querySelector('#biin-live-back').onclick=()=>go('detail',idx);panel.querySelector('#biin-live-edit').onclick=()=>openPlanner(idx,'personalizado');showPlan(panel.querySelector('#biin-live-timeline'),idx);oldChildren.forEach(child=>{child.style.setProperty('display','none','important');child.setAttribute('aria-hidden','true')});}
function myTrips(){if(!session()){go('login');return}document.querySelector('#biin-trip-overlay')?.remove();const overlay=document.createElement('div');overlay.id='biin-trip-overlay';overlay.className='biin-trip-overlay';const all=get('plans',[]);const u=session();overlay.innerHTML=`<header><button type="button" id="trip-back">←</button><div><small>BIIN · MI VIAJE</small><h2>Mis itinerarios</h2><p>Los viajes de ${escapeHtml(u.name)}</p></div></header><div class="biin-trip-content"><button class="biin-trip-create" id="trip-new">+ Planear otro viaje</button><div id="trip-cards"></div></div>`;document.body.append(overlay);overlay.querySelector('#trip-back').onclick=()=>overlay.remove();overlay.querySelector('#trip-new').onclick=()=>{overlay.remove();go('search')};const cards=overlay.querySelector('#trip-cards');if(!all.length){cards.innerHTML='<div class="biin-plan-summary"><h3>Todavía no tienes planes guardados</h3><p>En Rutas selecciona un destino y elige un itinerario recomendado o personalizado.</p></div>'}else all.forEach(p=>{let card=document.createElement('section');card.className='biin-trip-card';let title=document.createElement('h3');title.textContent=names[p.dest];let summary=document.createElement('p');summary.textContent=`${p.mode==='recomendado'?'Recomendado':'Personalizado'} · ${p.date} · ${p.hours} horas · ${p.places.length} lugares`;let places=document.createElement('p');places.textContent=p.places.join(' · ');let controls=document.createElement('div');controls.className='biin-trip-buttons';let open=document.createElement('button');open.textContent='Ver recorrido';open.onclick=()=>go('itinerary',p.dest);let edit=document.createElement('button');edit.textContent='Editar';edit.onclick=()=>{overlay.remove();openPlanner(p.dest,p.mode)};let del=document.createElement('button');del.textContent='Eliminar';del.className='biin-muted';del.onclick=()=>{put('plans',get('plans',[]).filter(x=>x.dest!==p.dest));overlay.remove();myTrips()};controls.append(open,edit,del);card.append(title,summary,places,controls);cards.append(card)});}
function escapeHtml(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function renderProfile(){
 const u=session();if(!u)return;const main=document.querySelector('main');if(!main)return;
 const photo=main.querySelector('img[data-alt*="Melanie"]');if(photo){const avatar=document.createElement('div');avatar.className='biin-avatar-fallback';avatar.textContent=(u.name||'Usuario').split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();photo.replaceWith(avatar);}
 main.querySelectorAll('h2').forEach(x=>{if(/Melanie/i.test(x.textContent))x.textContent=u.name||'Usuario'});
 main.querySelectorAll('span').forEach(x=>{if(/melanie.g@correo.com/i.test(x.textContent))x.textContent=u.email;if(/\+52 999 412 8820/i.test(x.textContent))x.remove();if(/Usuario Verificado BIIN/i.test(x.textContent))x.textContent='Cuenta BIIN'});
 // Los itinerarios planificados NO son viajes realizados. Nunca inventar trayectos.
 const completed=get('completedTrips',[]),visited=get('visitedTowns',[]), saved=get('savedRoutes',[]),plans=get('plans',[]);
 const statPairs=[['Viajes hechos',completed.length],['Rutas fijas',saved.length],['Pueblos Mágicos',new Set(visited).size]];
 for(const [label,value] of statPairs){const txt=[...main.querySelectorAll('div')].find(el=>el.children.length===0&&el.textContent.trim()===label);const card=txt?.closest('.bg-surface-container-lowest');const number=card?.querySelector('.font-headline-sm');if(number)number.textContent=String(value)}
 const captions=[...main.querySelectorAll('span')];const lastCaption=captions.find(x=>/Último trayecto/i.test(x.textContent)&&x.children.length===0);
 const lastSection=lastCaption?.parentElement?.parentElement;
 if(lastSection){lastSection.replaceChildren();let heading=document.createElement('span');heading.className='font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold px-1';heading.textContent='Último trayecto';let card=document.createElement('div');card.className='bg-surface-container-lowest rounded-xl p-space-md shadow-sm';if(completed.length){const last=completed[completed.length-1];card.textContent=(last.origin||'Mérida')+' → '+(last.destination||'Destino')+' · '+(last.date||'');}else{card.textContent='Aún no has realizado ningún viaje.';}lastSection.append(heading,card)}
 const savedCaption=captions.find(x=>/Itinerarios guardados/i.test(x.textContent)&&x.children.length===0);
 const savedSection=savedCaption?.parentElement?.parentElement;
 if(savedSection){const grid=savedSection.querySelector('.grid');if(grid){grid.replaceChildren();if(!plans.length){const empty=document.createElement('div');empty.className='biin-empty-profile';empty.textContent='Todavía no tienes itinerarios guardados.';grid.append(empty)}else{plans.forEach(plan=>{const card=document.createElement('div');card.className='biin-saved-preview';const name=document.createElement('strong');name.textContent=names[plan.dest]||'Mi itinerario';const summary=document.createElement('span');summary.textContent=(plan.places?.length||0)+' lugares · '+plan.date;const btn=document.createElement('button');btn.textContent='Ver itinerario';btn.onclick=()=>go('itinerary',plan.dest);card.append(name,summary,btn);grid.append(card)})}}}
 main.querySelectorAll('button').forEach(b=>{if(/ver ruta/i.test(b.textContent)&&!b.closest('.biin-saved-preview'))b.style.display='none'});
 // Real account details and meaningful profile controls; never show another person's sample data.
 main.querySelectorAll('img').forEach(img=>{if(/melanie|portrait photography/i.test((img.alt||'')+' '+(img.getAttribute('data-alt')||''))){const avatar=document.createElement('div');avatar.className='biin-avatar-fallback';avatar.textContent=(u.name||'U').trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('').toUpperCase();img.replaceWith(avatar)}});
 const details=document.createElement('section');details.className='biin-profile-account';details.innerHTML='<h3>Mi cuenta</h3><p><strong>Nombre:</strong> <span class="biin-account-name"></span></p><p><strong>Correo:</strong> <span class="biin-account-email"></span></p><div class="biin-profile-account-actions"><button id="biin-edit-account">Editar datos</button><button id="biin-security">Seguridad</button><button id="biin-profile-logout">Cerrar sesión</button></div>';
 details.querySelector('.biin-account-name').textContent=u.name||'Usuario';details.querySelector('.biin-account-email').textContent=u.email||'';
 details.querySelector('#biin-edit-account').onclick=()=>dialog('Editar mi cuenta',[{key:'name',label:'Nombre',value:u.name||''},{key:'email',label:'Correo',type:'email',value:u.email||''}],v=>{if(!v.name?.trim()||!v.email?.trim()){note('Completa tus datos');return}put('session',{...u,...v});location.reload()});
 details.querySelector('#biin-security').onclick=()=>extraSheet('Seguridad de tu cuenta','<p>Tu sesión de demostración está guardada en este navegador. Al cerrar sesión se solicitará de nuevo iniciar sesión.</p>');
 details.querySelector('#biin-profile-logout').onclick=logout;
 main.append(details);
 const section=document.createElement('section');section.className='biin-profile-menu';
 section.innerHTML='<h3>Mi BIIN</h3><div class="biin-profile-menu-list"></div>';
 const items=[
 ['♡','Ubicaciones favoritas',()=>{const fav=get('favorites',[]);extraSheet('Ubicaciones favoritas',fav.length?'<p>Tienes '+fav.length+' lugares guardados.</p>':'<p>Todavía no has guardado ubicaciones favoritas.</p>')}],
 ['▤','Mis rutas guardadas',()=>savedDialog()],
 ['▦','Mis itinerarios',()=>myTrips()],
 ['⚙','Configuración',()=>extraSheet('Configuración','<p>Preferencias y ajustes de tu experiencia BIIN.</p>')],
 ['♧','Notificaciones',()=>extraSheet('Notificaciones','<p>No tienes notificaciones nuevas.</p>')],
 ['?','Ayuda y asistencia',()=>extraSheet('Ayuda','<p>Consulta rutas, guarda destinos y organiza itinerarios desde las pestañas inferiores.</p>')],
 ['ⓘ','Acerca de BIIN',()=>extraSheet('Acerca de BIIN','<p>Plataforma de rutas y experiencias de Yucatán.</p>')],
 ['⇥','Cerrar sesión',logout]
 ];
 const list=section.querySelector('.biin-profile-menu-list');
 items.forEach(([symbol,label,fn])=>{const b=document.createElement('button');b.type='button';b.className='biin-profile-menu-item';const sym=document.createElement('span');sym.className='biin-profile-menu-icon';sym.textContent=symbol;const txt=document.createElement('span');txt.textContent=label;const arrow=document.createElement('span');arrow.textContent='›';arrow.className='biin-profile-menu-arrow';b.append(sym,txt,arrow);b.addEventListener('click',fn);list.append(b)});
 main.append(section);

}


})();
