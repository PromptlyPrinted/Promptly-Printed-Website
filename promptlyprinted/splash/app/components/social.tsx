import { Tweet } from 'react-tweet';

const tweets = [
  '1853560800050651632',
  '1853447982781239383',
  '1853242495540363750',
  '1853191842377941445',
  '1853201667480527032',
  '1853535228746489966',
  '1853172223533633623',
  '1853210238586876361',
  '1853763013406265717',
  '1853180857198014719',
  '1853246071566180575',
  '1853318197891490178',
  '1853202171350884569',
  '1853188496288100420',
  '1853183811195949065',
  '1853174376696623129',
  '1853310553407762491',
  '1853556609030434979',
  '1853734512024334340',
  '1853769403541639569',
  '1853436749650755708',
  '1853448825454592211',
  '1853434573339738583',
  '1853429177459905008',
  '1853423751464952051',
  '1853368337889100159',
  '1853367222946918616',
  '1853301610656698479',
  '1855655408112722325',
  '1856003447549538392',
  '1855956182823014891',
  '1855656670346825737',
  '1856782547046600770',
  '1856800101718499701',
  '1854993374207422474',
  '1853432188391305495',
  '1853595587167629730',
  '1853410692541641078',
  '1853250277006028983',
  '1854269038333153336',
  '1853539972953129259',
  '1857116301384454576',
  '1857165517032992870',
  '1857133756638797901',
  '1857107605136744735',
  '1856973107212259791',
  '1859478851513909690',
  '1857116639029874782',
  '1859898994148737286',
  '1863494562871746847',
  '1862904464715473405',
  '1865468239523807500',
  '1865474750320886046',
  '1864885640917356648',
  '1858758851798925812',
];

export const Social = () => (
  <section className="grid sm:grid-cols-3 sm:divide-x" id="community">
    <div className="hidden bg-dashed sm:block">
      <div className="sticky top-14 p-8">
        <h2 className="font-bold text-4xl tracking-tight">
          Loved by the community
        </h2>
      </div>
    </div>
    <div className="columns-1 gap-4 p-8 sm:col-span-2 md:columns-2">
      {tweets.map((tweet, index) => (
        <div key={tweet} className={index ? '' : 'sm:-mt-6'}>
          <Tweet id={tweet} />
        </div>
      ))}
    </div>
  </section>
);