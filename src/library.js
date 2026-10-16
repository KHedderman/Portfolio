// Replace provisional spine styling with verified edition photographs as supplied.
// Notes are intentionally empty: only Kait's own notes belong here.
export const books = [
  {id:'ai-for-good',title:'AI for Good',subtitle:'How Real People Are Using Artificial Intelligence to Fix Things That Matter',author:'Josh Tyrangiel',coverImage:'/images/books/ai-for-good-cover-photo.webp',spineImage:'/images/books/ai-for-good-spine-blue.webp',spineCrop:[.3426,.3220,.00735,.9874],spineRelief:0,spineSilhouette:true,color:'#e9e8e0',ink:'#171b20',height:3.87,width:.52,depth:2.55,binding:'paper',topic:'AI & society',bibliographyConfirmed:true,notes:[],takeaways:[],questions:[],purchaseUrl:'https://bookshop.org/search?keywords=AI%20for%20Good%20Josh%20Tyrangiel',affiliate:false},
  {id:'co-intelligence',title:'Co-Intelligence',subtitle:'Living and Working with AI',author:'Ethan Mollick',color:'#c45634',ink:'#f4e9ca',height:3.65,width:.72,depth:1.94,binding:'cloth',topic:'Working with AI',bibliographyConfirmed:true,notes:[],takeaways:[],questions:[],purchaseUrl:'https://bookshop.org/search?keywords=Co-Intelligence%20Ethan%20Mollick',affiliate:false},
  {id:'if-anyone-builds-it',title:'If Anyone Builds It, Everyone Dies',subtitle:'',author:'Eliezer Yudkowsky & Nate Soares',coverImage:'/images/books/if-anyone-builds-it-cover-photo.webp',spineImage:'/images/books/if-anyone-builds-it-spine.webp',spineCrop:[.345,.31],color:'#111416',ink:'#f0ebdf',height:3.87,width:.44,depth:2.5,binding:'cloth',topic:'The future of AI',bibliographyConfirmed:true,notes:[],takeaways:[],questions:[],purchaseUrl:'https://bookshop.org/search?keywords=If%20Anyone%20Builds%20It%20Everyone%20Dies',affiliate:false},
  {id:'empire-of-ai',title:'Empire of AI',subtitle:'Dreams and Nightmares in Sam Altman’s OpenAI',author:'Karen Hao',coverImage:'/images/books/empire-of-ai-cover-photo.webp',coverCrop:[.40373,.45894,.03226,.92627],spineImage:'/images/books/empire-of-ai-spine-photo.webp',spineCrop:[.15804,.12629,.02673,.95300],spineRelief:0,spineSilhouette:true,color:'#ed8456',ink:'#151515',height:4.08,width:.78,depth:2.68,binding:'paper',topic:'AI & power',bibliographyConfirmed:true,notes:[],takeaways:[],questions:[],purchaseUrl:'https://bookshop.org/search?keywords=Empire%20of%20AI%20Karen%20Hao',affiliate:false},
  {id:'artificial-intimacy',title:'Artificial Intimacy',subtitle:'',author:'Sherry Turkle',color:'#b5aa92',ink:'#2d3635',height:3.47,width:.64,depth:1.88,binding:'paper',topic:'Technology & connection',bibliographyConfirmed:false,notes:[],takeaways:[],questions:[],purchaseUrl:'https://bookshop.org/search?keywords=Artificial%20Intimacy%20Sherry%20Turkle',affiliate:false},
];
// A narrow physical seam keeps adjacent jackets separate without overlapping.
const bindingGap=.012;
const total=books.reduce((sum,b)=>sum+b.width,0)+bindingGap*(books.length-1);
let cursor=-total/2;
books.forEach(book=>{book.x=cursor+book.width/2;book.spineImage??=null;book.coverImage??=null;cursor+=book.width+bindingGap;});
export const bookendX=total/2+.86;

export const shelfFramingHeight=Math.max(4.35,...books.map(book=>book.height+.5));
