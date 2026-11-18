const LOCALES = ["en","tr","pt-BR","es","ru","id","de","fr","ja"];
export const SOCIAL_COPY = {
 en:{share:"SHARE BEST SCORE ON X",invite:"INVITE A PILOT BY EMAIL",copy:"COPY GAME LINK",note:"Sharing is always optional. Capsule rewards will only be issued for verified invitations after anti-abuse checks are live.",copied:"Game link copied.",copyFail:"Could not copy the link. Select and copy it manually.",score:"My TAVIRO best score is",tagline:"One core. Infinite void.",subject:"Join me in TAVIRO",body:"I have been playing TAVIRO, an independent space-survival game. Try a run and see how far you can go:"},
 tr:{share:"EN İYİ SKORU X'TE PAYLAŞ",invite:"E-POSTAYLA PİLOT DAVET ET",copy:"OYUN BAĞLANTISINI KOPYALA",note:"Paylaşım isteğe bağlıdır. Kapsül ödülleri yalnızca kötüye kullanım kontrolleri etkinleştikten sonra doğrulanmış davetler için verilecektir.",copied:"Oyun bağlantısı kopyalandı.",copyFail:"Bağlantı kopyalanamadı. Lütfen elle seçip kopyala.",score:"TAVIRO en iyi skor rekorum:",tagline:"Tek çekirdek. Sonsuz boşluk.",subject:"TAVIRO'ya katıl",body:"Bağımsız uzay hayatta kalma oyunu TAVIRO'yu oynuyorum. Sen de dene ve ne kadar ilerleyebileceğini gör:"},
 "pt-BR":{share:"COMPARTILHAR RECORDE NO X",invite:"CONVIDAR UM PILOTO POR E-MAIL",copy:"COPIAR LINK DO JOGO",note:"Compartilhar é opcional. Cápsulas só serão concedidas por convites verificados quando as proteções contra abuso estiverem ativas.",copied:"Link do jogo copiado.",copyFail:"Não foi possível copiar o link. Copie manualmente.",score:"Meu recorde no TAVIRO é",tagline:"Um núcleo. Vazio infinito.",subject:"Venha jogar TAVIRO",body:"Estou jogando TAVIRO, um jogo independente de sobrevivência espacial. Experimente uma partida:"},
 es:{share:"COMPARTIR RÉCORD EN X",invite:"INVITAR A UN PILOTO POR CORREO",copy:"COPIAR ENLACE DEL JUEGO",note:"Compartir es opcional. Las cápsulas solo se otorgarán por invitaciones verificadas cuando estén activas las protecciones contra abusos.",copied:"Enlace del juego copiado.",copyFail:"No se pudo copiar el enlace. Cópialo manualmente.",score:"Mi mejor puntuación en TAVIRO es",tagline:"Un núcleo. Vacío infinito.",subject:"Únete a TAVIRO",body:"Estoy jugando a TAVIRO, un juego independiente de supervivencia espacial. ¡Prueba una partida!"},
 ru:{share:"ПОДЕЛИТЬСЯ РЕКОРДОМ В X",invite:"ПРИГЛАСИТЬ ПИЛОТА ПО ПОЧТЕ",copy:"СКОПИРОВАТЬ ССЫЛКУ НА ИГРУ",note:"Публикация необязательна. Капсулы будут выдаваться только за подтверждённые приглашения после включения защиты от злоупотреблений.",copied:"Ссылка на игру скопирована.",copyFail:"Не удалось скопировать ссылку. Скопируйте её вручную.",score:"Мой лучший результат в TAVIRO:",tagline:"Одно ядро. Бесконечная пустота.",subject:"Присоединяйся к TAVIRO",body:"Я играю в TAVIRO — независимую космическую игру на выживание. Попробуй свой забег:"},
 id:{share:"BAGIKAN SKOR TERBAIK DI X",invite:"UNDANG PILOT MELALUI EMAIL",copy:"SALIN TAUTAN GAME",note:"Berbagi bersifat opsional. Kapsul hanya akan diberikan untuk undangan terverifikasi setelah perlindungan penyalahgunaan aktif.",copied:"Tautan game disalin.",copyFail:"Tautan tidak dapat disalin. Silakan salin secara manual.",score:"Skor terbaik TAVIRO saya adalah",tagline:"Satu inti. Kehampaan tanpa batas.",subject:"Ayo main TAVIRO",body:"Saya sedang memainkan TAVIRO, game bertahan hidup luar angkasa independen. Coba satu permainan:"},
 de:{share:"BESTENSTAND AUF X TEILEN",invite:"PILOT PER E-MAIL EINLADEN",copy:"SPIEL-LINK KOPIEREN",note:"Teilen ist freiwillig. Kapseln gibt es erst für bestätigte Einladungen, sobald der Missbrauchsschutz aktiv ist.",copied:"Spiel-Link kopiert.",copyFail:"Link konnte nicht kopiert werden. Bitte manuell kopieren.",score:"Mein TAVIRO-Bestwert ist",tagline:"Ein Kern. Unendliche Leere.",subject:"Spiel TAVIRO mit mir",body:"Ich spiele TAVIRO, ein unabhängiges Weltraum-Survival-Spiel. Probiere einen Lauf:"},
 fr:{share:"PARTAGER LE RECORD SUR X",invite:"INVITER UN PILOTE PAR E-MAIL",copy:"COPIER LE LIEN DU JEU",note:"Le partage est facultatif. Les capsules seront réservées aux invitations vérifiées lorsque les protections anti-abus seront actives.",copied:"Lien du jeu copié.",copyFail:"Impossible de copier le lien. Copiez-le manuellement.",score:"Mon meilleur score sur TAVIRO :",tagline:"Un noyau. Le vide infini.",subject:"Rejoins-moi sur TAVIRO",body:"Je joue à TAVIRO, un jeu indépendant de survie spatiale. Essaie une partie :"},
 ja:{share:"ベストスコアをXで共有",invite:"メールでパイロットを招待",copy:"ゲームリンクをコピー",note:"共有は任意です。不正利用対策が有効になった後、確認済みの招待にのみカプセルを付与します。",copied:"ゲームリンクをコピーしました。",copyFail:"リンクをコピーできませんでした。手動でコピーしてください。",score:"TAVIROの自己ベスト：",tagline:"ひとつのコア。無限の虚空。",subject:"TAVIROを一緒にプレイしよう",body:"独立系宇宙サバイバルゲームTAVIROをプレイしています。ぜひ試してみてください："}
};

const SOCIAL_PANEL_COPY = {
  "en": {
    "kicker": "PILOT COMMUNITY",
    "heading": "Share your flight record",
    "optional": "OPTIONAL",
    "description": "Show your personal best or invite someone to try TAVIRO. Sharing never changes gameplay or score validity."
  },
  "tr": {
    "kicker": "PİLOT TOPLULUĞU",
    "heading": "Uçuş rekorunu paylaş",
    "optional": "İSTEĞE BAĞLI",
    "description": "En iyi skorunu paylaş veya bir arkadaşını TAVIRO'yu denemeye davet et. Paylaşım, oynanışı veya skor geçerliliğini değiştirmez."
  },
  "pt-BR": {
    "kicker": "COMUNIDADE DE PILOTOS",
    "heading": "Compartilhe seu recorde",
    "optional": "OPCIONAL",
    "description": "Mostre seu melhor resultado ou convide alguém para experimentar TAVIRO. Compartilhar não altera a jogabilidade nem a validade da pontuação."
  },
  "es": {
    "kicker": "COMUNIDAD DE PILOTOS",
    "heading": "Comparte tu récord de vuelo",
    "optional": "OPCIONAL",
    "description": "Muestra tu mejor puntuación o invita a alguien a probar TAVIRO. Compartir no cambia la jugabilidad ni la validez de la puntuación."
  },
  "ru": {
    "kicker": "СООБЩЕСТВО ПИЛОТОВ",
    "heading": "Поделитесь своим рекордом",
    "optional": "НЕОБЯЗАТЕЛЬНО",
    "description": "Покажите лучший результат или пригласите кого-нибудь попробовать TAVIRO. Публикация не влияет на игровой процесс и достоверность результата."
  },
  "id": {
    "kicker": "KOMUNITAS PILOT",
    "heading": "Bagikan catatan penerbangan",
    "optional": "OPSIONAL",
    "description": "Tunjukkan skor terbaik atau undang seseorang mencoba TAVIRO. Berbagi tidak mengubah permainan maupun keabsahan skor."
  },
  "de": {
    "kicker": "PILOTEN-COMMUNITY",
    "heading": "Teile deinen Flugrekord",
    "optional": "FREIWILLIG",
    "description": "Zeige deinen Bestwert oder lade jemanden ein, TAVIRO auszuprobieren. Das Teilen verändert weder das Gameplay noch die Gültigkeit des Ergebnisses."
  },
  "fr": {
    "kicker": "COMMUNAUTÉ DES PILOTES",
    "heading": "Partagez votre record de vol",
    "optional": "FACULTATIF",
    "description": "Montrez votre meilleur score ou invitez quelqu’un à essayer TAVIRO. Le partage ne modifie ni le jeu ni la validité du score."
  },
  "ja": {
    "kicker": "パイロットコミュニティ",
    "heading": "フライト記録を共有",
    "optional": "任意",
    "description": "ベストスコアを紹介したり、TAVIROに誰かを招待したりできます。共有によってゲームプレイやスコアの有効性が変わることはありません。"
  }
};
export function buildScoreShareText(score,pilot="Pilot",locale="en"){
 const copy=SOCIAL_COPY[LOCALES.includes(locale)?locale:"en"];
 const value=Math.max(0,Math.floor(Number(score)||0)).toLocaleString(locale==="tr"?"tr-TR":locale);
 const name=String(pilot||"Pilot").trim().slice(0,32)||"Pilot";
 return `${name} · ${copy.score} ${value} · ${copy.tagline}`;
}
export function buildInviteEmail(url,locale="en"){
 const copy=SOCIAL_COPY[LOCALES.includes(locale)?locale:"en"];
 return {subject:copy.subject,body:`${copy.body}\n\n${url}\n\n${copy.tagline}`};
}
function safeLocale(){try{const value=localStorage.getItem("cosmic-scrap-language");return LOCALES.includes(value)?value:"en"}catch{return"en"}}
export function mountSocialShare(){
 const share=document.getElementById("share-best-x"),invite=document.getElementById("invite-pilot-email"),copyButton=document.getElementById("copy-game-link"),note=document.getElementById("social-share-note");
 if(!share||!invite||!copyButton)return false;
 const localize=()=>{const locale=safeLocale(),words=SOCIAL_COPY[locale]||SOCIAL_COPY.en,panel=SOCIAL_PANEL_COPY[locale]||SOCIAL_PANEL_COPY.en;share.textContent=words.share;invite.textContent=words.invite;copyButton.textContent=words.copy;if(note)note.textContent=words.note;const set=(id,value)=>{const el=document.getElementById(id);if(el)el.textContent=value};set("social-kicker",panel.kicker);set("social-heading",panel.heading);set("social-optional",panel.optional);set("social-description",panel.description)};
 localize();
 if(share.dataset.bound==="true")return true;
 share.dataset.bound="true";
 const gameUrl=new URL("./",window.location.href).href;
 const score=()=>Math.max(0,Number(document.getElementById("best-score")?.textContent?.replace(/[^0-9]/g,""))||0);
 const pilot=()=>document.getElementById("pilot-name")?.textContent?.trim()||"Pilot";
 share.addEventListener("click",()=>{
  const locale=safeLocale(),text=buildScoreShareText(score(),pilot(),locale);
  const url="https://twitter.com/intent/tweet?text="+encodeURIComponent(text)+"&url="+encodeURIComponent(gameUrl);
  window.open(url,"_blank","noopener,noreferrer");
 });
 invite.addEventListener("click",()=>{
  const mail=buildInviteEmail(gameUrl,safeLocale());
  window.location.href="mailto:?subject="+encodeURIComponent(mail.subject)+"&body="+encodeURIComponent(mail.body);
 });
 copyButton.addEventListener("click",async()=>{
  const words=SOCIAL_COPY[safeLocale()]||SOCIAL_COPY.en;
  try{await navigator.clipboard.writeText(gameUrl);if(note)note.textContent=words.copied}
  catch{if(note)note.textContent=words.copyFail}
 });
 return true;
}
if(typeof document!=="undefined"){mountSocialShare();window.addEventListener("cosmic-scrap:language-changed",mountSocialShare)}
