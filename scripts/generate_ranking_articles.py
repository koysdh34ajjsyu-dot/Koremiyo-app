import os, sys, json, csv, openpyxl
sys.stdout.reconfigure(encoding='utf-8')

articles_dir = 'd:/AIproject/DMMaffireight/dlsite_ranking_articles'
csv_path = 'd:/AIproject/DMMaffireight/content_manager.csv'
excel_path = 'd:/AIproject/DMMaffireight/content_manager.xlsx'

os.makedirs(articles_dir, exist_ok=True)

# 記事データの定義
articles_data = [
    {
        "file_name": "06_RJ328940_cultivator.html",
        "dmm_id": "RJ328940",
        "title": "【30%OFF】『カルティベーター ～引退騎士とモン娘のにぎやか開拓記～』徹底レビュー！14人の個性派モン娘と紡ぐ100時間級の濃厚スローライフ＆開拓H",
        "category": "同人RPG",
        "tags": "DLsite, 同人RPG, スローライフ, モンスター娘, ハーレム, 農業, ふらいんぐパンジャンドラム, セール",
        "sale_info": "30% OFF",
        "official_url": "https://www.dlsite.com/maniax/work/=/product_id/RJ328940.html",
        "aff_url": "https://dlaf.jp/maniax/dlaf/=/t/i/link/work/aid/Koremiyoonline/id/RJ328940.html",
        "main_img": "https://img.dlsite.jp/modpub/images2/work/doujin/RJ329000/RJ328940_img_main.jpg",
        "sub_imgs": [
            "https://img.dlsite.jp/modpub/images2/work/doujin/RJ329000/RJ328940_img_smp1.jpg",
            "https://img.dlsite.jp/modpub/images2/work/doujin/RJ329000/RJ328940_img_smp2.jpg",
            "https://img.dlsite.jp/modpub/images2/work/doujin/RJ329000/RJ328940_img_smp3.jpg"
        ],
        "gallery_cta_copy": "＼ 14人のモン娘との濃厚開拓Hの全貌はこちら ／",
        "circle": "ふらいんぐパンジャンドラム",
        "catchcopy": "Hは濃厚、暮らしは農耕。14人のモン娘と愛を育む、100時間級の大長編スローライフRPG！",
        "rating": "4.9",
        "summary_quote": "「戦いに疲れた引退騎士がたどり着いたのは、個性豊かで愛らしいモンスター娘たちが暮らす未開の土地。農業と開拓を楽しみながら、種族ごとに全く異なる極上Hで絆を深めていく、まさに男のロマンを詰め込んだ最高峰のスローライフRPGです！」",
        "pain_points": [
            "日々の忙しさを忘れて、可愛い女の子たちとじっくり温かいスローライフを送りたい",
            "14種族それぞれ異なるモンスター娘特有のフェチ＆濃厚エロを骨の髄まで味わいたい",
            "数時間で終わる浅いゲームではなく、何十時間も没頭できる本格的なやり込みRPGを求めている"
        ],
        "highlights": [
            {
                "title": "1. 14人全員が完全ヒロイン！種族ごとのフェチを極限まで刺激する濃厚H",
                "desc": "スライム、ハーピー、ラミア、ケンタウロス、サキュバスなど、14人のモン娘それぞれに専用の開拓ストーリーと膨大なHイベントを収録。人外娘ならではの身体の仕組みや快楽のツボを突いた生々しいエロ描写は圧巻の一言！愛を深めるごとに見せる無防備でメスな表情に脳汁が止まりません。"
            },
            {
                "title": "2. 荒野を切り拓き村を発展させる、中毒性MAXの本格農業＆開拓システム",
                "desc": "畑を耕し、作物を育て、モンスター娘たちと協力して施設を拡張していくクラフト＆シミュレーション要素が超本格的。収穫した素材で料理を作ったり、娘たちにプレゼントを贈って好感度を上げるサイクルが心地よく、止め時を見失うほどの没入感を誇ります。"
            },
            {
                "title": "3. 100時間遊べる圧倒的ボリュームと快適すぎるプレイアビリティ",
                "desc": "メインシナリオ、サブクエスト、自由探索、そして膨大な回想シーンと、同人ゲームの枠を完全に超えた100時間級の超大作。UIの操作感やメッセージスキップ、ファストトラベルなど快適性も徹底的に作り込まれており、長時間のプレイでもストレスゼロで楽しめます。"
            }
        ],
        "media_type": "images",
        "pros": [
            "14人のモン娘すべてに濃密な個別ルートと多彩なHシーンを完備",
            "開拓・農業・戦闘のバランスが絶妙で、ゲーム単体としての完成度が極めて高い",
            "ふらいんぐパンジャンドラム作品ならではの温かいシナリオと圧倒的テキスト量"
        ],
        "cons": [
            "ボリュームが100時間級と膨大すぎるため、週末だけでサクッと全回収したい人には多すぎる可能性",
            "モンスター娘（人外要素）がメインのため、完全な通常の人間のヒロインだけを求めている人には不向き"
        ],
        "closing_text": "これほどの手間と熱量が注ぎ込まれた大作RPGが、30%OFFのセール価格で手に入るチャンスは見逃せません。今夜から、14人の愛しいモン娘たちに囲まれた贅沢すぎる開拓生活をスタートさせてみませんか？"
    },
    {
        "file_name": "07_RJ01691063_irreversible_mesuochi.html",
        "dmm_id": "RJ01691063",
        "title": "『不可逆性・メス堕ち催淫プログラム』徹底レビュー！徐々に理性が侵食され快楽の雌犬へと仕立て上げられる極上催眠ASMR",
        "category": "音声作品",
        "tags": "DLsite, 音声作品, ASMR, 催眠, メス堕ち, 洗脳, Hypnotic_Yanh, バイノーラル",
        "sale_info": "人気ランキング上位",
        "official_url": "https://www.dlsite.com/maniax/work/=/product_id/RJ01691063.html",
        "aff_url": "https://dlaf.jp/maniax/dlaf/=/t/n/link/work/aid/Koremiyoonline/id/RJ01691063.html",
        "main_img": "https://img.dlsite.jp/modpub/images2/work/doujin/RJ01692000/RJ01691063_img_main.jpg",
        "sub_imgs": [],
        "chobit_url": "https://chobit.cc/embed/7yeyc/czdzxi9k?aid=Koremiyoonline",
        "circle": "Hypnotic_Yanh",
        "catchcopy": "一度堕ちたら二度と元には戻れない…不可逆的な快楽で脳の芯までメスに染まる極上催眠体験！",
        "rating": "4.8",
        "summary_quote": "「静かな囁きと緻密に計算されたバイノーラル音響で、聴き手の理性を一枚ずつ剥ぎ取っていく本格催眠音声。抵抗しようとするほど深みにハマり、気づけば自ら快楽を求めて喘いでしまう背徳のメス堕ち体験です！」",
        "pain_points": [
            "普通の甘々音声では物足りず、頭の芯を直接痺れさせるようなディープな催眠にかかりたい",
            "理性が快楽に負けて完全降伏していくメス堕ちの背徳シチュエーションにゾクゾクする",
            "KU100など最高峰の音響機材で収録された、吐息が耳の奥に直撃する臨場感を味わいたい"
        ],
        "highlights": [
            {
                "title": "1. 逃げ場のない脳内直接侵食！計算し尽くされた催淫誘導スクリプト",
                "desc": "心地よいトリガー音と低く甘い声の誘導により、聴き手の意識が急速に沈み込んでいきます。「もう我慢しなくていいのですよ…」と耳元で優しく囁かれるたびに、脳内の抵抗感が溶けて消え、身体の奥がじんわりと熱くなっていくリアルな没入感が味わえます。"
            },
            {
                "title": "2. 理性の崩壊から完全屈服へ…段階的に深化するメス堕ちプロセス",
                "desc": "単にいきなり淫乱になるのではなく、「戸惑い・抵抗」から「快感の自覚」、そして「自ら快楽を懇願するメス堕ち」へと至るグラデーションが見事。不可逆というタイトルの通り、元の自分には戻れない恐怖と陶酔が混ざり合った最高のスリルを堪能できます。"
            },
            {
                "title": "3. 耳元を這うような生々しい吐息と唾液の音響クオリティ",
                "desc": "360度立体音響を活かした耳舐め・吐息・囁きが左右から交差するように響き、イヤホンを通して直接鼓膜を舌先で撫で回されているかのような生々しさ。部屋の明かりを消して目を閉じれば、そこは完全な催眠調教室へと変貌します。"
            }
        ],
        "media_type": "audio_chobit",
        "gallery_cta_copy": "＼ 不可逆的なメス堕ち催淫ボイスの全貌はこちら ／",
        "pros": [
            "催眠音声としての完成度が極めて高く、導入からトランス状態への誘導が非常にスムーズ",
            "メス堕ち・完全服従という背徳的なフェチを極限まで突き詰めたシナリオ構成",
            "クリアな高音質バイノーラル録音で、吐息の暖かさや距離感が克明に伝わる"
        ],
        "cons": [
            "催眠誘導が本格的なため、集中して聴く環境（静かな部屋・良質なイヤホン/ヘッドホン）が必須",
            "ライトな日常イチャラブを求めている人には刺激が強すぎるハードな洗脳シチュエーション"
        ],
        "closing_text": "今夜はすべての理性を手放して、耳元から注ぎ込まれる甘美な催淫プログラムに身を委ねてみませんか？ 公式の無料サンプル試聴プレイヤーで、まずはその驚異の没入感を体感してみてください。"
    },
    {
        "file_name": "08_RJ01556529_home_peeping.html",
        "dmm_id": "RJ01556529",
        "title": "【10%OFF】『HOME』徹底レビュー！隣の部屋の幼馴染を覗き見る背徳感…日常が狂気と快楽に侵食されていく名作寝取りSLG",
        "category": "シミュレーション",
        "tags": "DLsite, シミュレーション, 覗き見, 寝取り, NTR, 幼馴染, SORAREVO, セール",
        "sale_info": "10% OFF",
        "official_url": "https://www.dlsite.com/maniax/work/=/product_id/RJ01556529.html",
        "aff_url": "https://dlaf.jp/maniax/dlaf/=/t/n/link/work/aid/Koremiyoonline/id/RJ01556529.html",
        "main_img": "https://img.dlsite.jp/modpub/images2/work/doujin/RJ01557000/RJ01556529_img_main.jpg",
        "sub_imgs": [],
        "chobit_url": "https://chobit.cc/embed/5lfux/5tkba8l2?aid=Koremiyoonline",
        "circle": "SORAREVO",
        "catchcopy": "壁の隙間から覗く、幼馴染の秘密の生活…純粋だった彼女が見知らぬ男の肉棒に堕ちていく背徳SLG",
        "rating": "4.7",
        "summary_quote": "「隣の部屋に住む大好きな幼馴染。壁に開いた小さな穴から彼女の私生活を覗き見るうちに、見知らぬ男が彼女の部屋を訪れるようになり…。胸を締め付けられる嫉妬と、それを上回る猛烈な性的興奮が交錯する傑作覗き見NTRです！」",
        "pain_points": [
            "好きな女の子が別の男に寝取られていく背徳感と焦燥感で頭をおかしくしたい",
            "覗き見というシチュエーションならではの、リアルな緊張感と生々しい生活音を味わいたい",
            "単なるエロだけでなく、ヒロインの心理変化が克明に描かれた質の高いシナリオを楽しみたい"
        ],
        "highlights": [
            {
                "title": "1. 呼吸の音まで聞こえる緊迫感！リアルタイム覗き見システム",
                "desc": "主人公は自室の壁穴や監視カメラを通じて、隣室の幼馴染の生活を観察。着替えや入浴後の無防備な姿を息を潜めて見つめるスリルと、彼女の部屋で何が起きているのかを探る緊張感が抜群の臨場感を生み出しています。"
            },
            {
                "title": "2. 純情な少女が肉欲に目覚めていく、生々しい心と身体の変貌",
                "desc": "最初は男に対して警戒していた幼馴染が、甘い言葉と強引な快楽責めによって徐々に心を許し、やがて自ら淫らな姿を見せるようになっていく過程が非常にリアル。主人公には絶対に見せなかったメスの顔を見せつけられる絶望と興奮が止まりません。"
            },
            {
                "title": "3. 覗き見るアングルと詳細な状況描写による背徳の極致",
                "desc": "ベッドの上、脱衣所、ソファなど様々なアングルから繰り広げられる濃厚な性行為。激しいピストン音や喘ぎ声が壁越しに響き渡り、手出しができない主人公の視点と同化することで、かつてない強烈なNTR脳汁を体感できます。"
            }
        ],
        "media_type": "video_chobit",
        "gallery_cta_copy": "＼ 幼馴染の秘密の生活と覗き見NTRの全貌はこちら ／",
        "pros": [
            "覗き見×寝取りというニッチながら需要の極めて高いフェチを最高水準で形にした名作",
            "SORAREVO作品特有の心理描写の丁寧さと、リアルなアニメーション演出",
            "マルチエンディング対応で、プレイヤーの行動次第で迎える結末の変化を楽しめる"
        ],
        "cons": [
            "純愛やハッピーエンドだけを望む読者には精神的ダメージが大きい純度100%のNTR作品",
            "覗き見という受け身の構図が基本となるため、主人公がヒロインを抱きたい人には不向き"
        ],
        "closing_text": "胸がキュッと締め付けられるような嫉妬心と、下半身を直撃する強烈な昂揚感。10%OFFのこの機会に、壁の向こうで繰り広げられる禁断の覗き見体験をぜひご堪能ください。"
    },
    {
        "file_name": "09_RJ01702354_sakurou_escape.html",
        "dmm_id": "RJ01702354",
        "title": "【10%OFF】『搾廊 ～爆乳の異形が徘徊するループからの脱出～』徹底レビュー！テカぬる巨乳怪異に捕まったら即搾精…逃げ場なき一人称3Dホラー",
        "category": "3Dゲーム",
        "tags": "DLsite, 3Dゲーム, アクション, ホラー, 爆乳, 搾精, 脱出ゲーム, ちんあなごのたたき, セール",
        "sale_info": "10% OFF",
        "official_url": "https://www.dlsite.com/maniax/work/=/product_id/RJ01702354.html",
        "aff_url": "https://dlaf.jp/maniax/dlaf/=/t/n/link/work/aid/Koremiyoonline/id/RJ01702354.html",
        "main_img": "https://img.dlsite.jp/modpub/images2/work/doujin/RJ01703000/RJ01702354_img_main.jpg",
        "sub_imgs": [],
        "chobit_url": "https://chobit.cc/embed/2l5ng/3wai3bif?aid=Koremiyoonline",
        "circle": "ちんあなごのたたき",
        "catchcopy": "同じ廊下が無限に続く廃病院…暗闇から迫るテカぬる爆乳怪異から逃げ延びるか、搾り尽くされるか！",
        "rating": "4.8",
        "summary_quote": "「一人称視点で無限ループする不気味な廊下を探索するホラー脱出ゲーム。暗がりからぬるりと現れるのは、規格外の爆乳と豊満な肉体を持つ異形の美女たち！捕まれば最後、身動きを封じられて濃厚な搾精奉仕で理性を焼き切られます！」",
        "pain_points": [
            "『8番出口』ライクなループ脱出ホラーの緊張感と、極上のエロを同時に味わいたい",
            "テカテカに光るオイル肌、むちむちの爆乳モンスターに圧倒的なフィジカルで犯されたい",
            "3Dの臨場感あふれる主観視点で、怪異に押し倒される迫力満点のアニメーションを見たい"
        ],
        "highlights": [
            {
                "title": "1. 異変を見逃すな！本格ホラーゲームとしての高い没入感と緊張感",
                "desc": "薄暗い廊下を進みながら、壁の張り紙、照明の明滅、物音などの異変を察知して進退を決断。本格ホラーゲーム顔負けの不気味な空気感と環境音がプレイヤーの心拍数を跳ね上げます。"
            },
            {
                "title": "2. 捕まった瞬間、恐怖は最高潮の快楽へ！容赦なき爆乳搾精アニメーション",
                "desc": "怪異に接触してしまうと、一人称視点のまま床に押し倒され強制射精シーンへ突入！規格外の柔らかさを持つテカテカ巨乳で顔面を埋め尽くされ、太ももでガッチリとロックされながら、枯れ果てるまで精子を貪り尽くされるアニメーションは圧巻のド迫力です。"
            },
            {
                "title": "3. 複数存在する個性派怪異ヒロインと、豊富なゲームモード",
                "desc": "包帯ナース風の爆乳怪異や、長髪の異形美女など異なるタイプの捕食者が徘徊。脱出成功を目指す本編だけでなく、一度解放した捕食シーンを自由な視点でじっくり鑑賞できる回想モードも充実しています。"
            }
        ],
        "media_type": "video_chobit",
        "gallery_cta_copy": "＼ 逃げ場なき廃病院での爆乳搾精ホラーの全貌はこちら ／",
        "pros": [
            "ホラーゲームとしての完成度と、エロ（爆乳搾精）のクオリティが奇跡的な高次元で融合",
            "テカぬる肌の質感表現と、一人称主観視点の迫力が他作品の追随を許さない",
            "サクッと遊べるテンポの良さと、全CG回収のための周回やり込み要素"
        ],
        "cons": [
            "ジャンプスケア（急な驚かし要素）や不気味なホラー演出が苦手な人には注意が必要",
            "ヒロインが人間の女の子ではなく「怪異・人外」であるため、一般的な学園モノ等を好む人には好みが分かれる"
        ],
        "closing_text": "逃げ切りたい本能と、捕まってあの爆乳に溺れたい欲望が激突する至高のホラー体験。10%OFFセールの今、恐怖と快楽の無限ループへと足を踏み入れてみてください！"
    },
    {
        "file_name": "10_RJ01386956_lifeguard_holic.html",
        "dmm_id": "RJ01386956",
        "title": "『ライフガードホリック』徹底レビュー！元水泳部主将が挑むプール経営と水着美女たちとの甘美なハーレムサマー",
        "category": "シミュレーション",
        "tags": "DLsite, シミュレーション, 経営, プール, 水着, ギャル, ハーレム, Big S Studio",
        "sale_info": "人気シミュレーション",
        "official_url": "https://www.dlsite.com/maniax/work/=/product_id/RJ01386956.html",
        "aff_url": "https://dlaf.jp/maniax/dlaf/=/t/n/link/work/aid/Koremiyoonline/id/RJ01386956.html",
        "main_img": "https://img.dlsite.jp/modpub/images2/work/doujin/RJ01387000/RJ01386956_img_main.jpg",
        "sub_imgs": [
            "https://img.dlsite.jp/modpub/images2/work/doujin/RJ01387000/RJ01386956_img_smp1.jpg",
            "https://img.dlsite.jp/modpub/images2/work/doujin/RJ01387000/RJ01386956_img_smp2.jpg",
            "https://img.dlsite.jp/modpub/images2/work/doujin/RJ01387000/RJ01386956_img_smp3.jpg"
        ],
        "gallery_cta_copy": "＼ 水着美女たちとの甘美なハーレムサマーの全貌はこちら ／",
        "circle": "Big S Studio",
        "catchcopy": "眩しい太陽、輝く水飛沫、そして魅力的な水着美女たち…プールオーナーとして過ごす最高のひと夏！",
        "rating": "4.7",
        "summary_quote": "「怪我で水泳選手の夢を断たれた青年が、運命の勝負を機に市民プールの新オーナーに就任！個性豊かな監視員や利用客の美女たちと交流し、施設を立て直しながら特別な関係を築いていく爽快ハーレムSLGです！」",
        "pain_points": [
            "水着美女たちに囲まれて、明るく開放的な夏のシチュエーションで甘い恋とセックスを楽しみたい",
            "施設のアップグレードやスタッフ育成など、やりがいのある経営シミュレーションが好き",
            "ギャル、清楚系、お姉さんなど多彩なヒロインたちとの個別エピソードを堪能したい"
        ],
        "highlights": [
            {
                "title": "1. 経営を立て直しプールを拡大！やめられない施設発展サイクル",
                "desc": "利用客を増やして資金を稼ぎ、新しい売店やアトラクション、VIPラウンジを建設。プールがどんどん賑やかになり、訪れる美女たちのバリエーションも増えていくため、経営シミュレーションとしての達成感が抜群です。"
            },
            {
                "title": "2. 水着越しに伝わる体温と肌の弾力！フェチ全開の個別エピソード",
                "desc": "日焼け跡の眩しい元気系ギャル監視員や、控えめなスク水美少女、セクシーなビキニを着こなす大人の女性など、ヒロインごとの魅力が爆発。監視所やシャワールーム、夜の更けた静かなプールサイドでの密会など、夏ならではのシチュエーションが満載です。"
            },
            {
                "title": "3. 美麗なCGイラストと快適なゲームシステム",
                "desc": "Big S Studioの真骨頂である鮮やかな色彩と美しいキャラクターグラフィック。イベントシーンは細部まで描き込まれており、水滴のリアルな描写や肉感的なラインに釘付けになること間違いなしです。"
            }
        ],
        "media_type": "images",
        "pros": [
            "プール×水着×ハーレムという王道かつ爽快感あふれるシチュエーションを満喫できる",
            "経営要素とヒロイン攻略のテンポが良く、サクサクと進行してストレスがない",
            "複数ヒロインそれぞれの個別エンドや多彩な衣装差分が用意されている"
        ],
        "cons": [
            "ダークな鬱展開やハードな陵辱要素はなく、基本は明るいイチャラブ＆ハーレム展開",
            "ある程度経営の資金繰りを把握するまでは、少しコツが必要な場面がある"
        ],
        "closing_text": "あの頃憧れた、水着の美女たちと過ごす夢のような夏の思い出をゲームの中で。今すぐプールオーナーになって、彼女たちとの熱い夏をスタートさせましょう！"
    },
    {
        "file_name": "11_RJ01683949_mimikaki_slow.html",
        "dmm_id": "RJ01683949",
        "title": "【30%OFF】『【たっぷり無声音×耳奥舐め】お耳焦らし好きのための“超スロー耳奥舐め”』徹底レビュー！CV陽向葵ゅかの極上ダウナー囁きと脳トロ耳奥責め",
        "category": "音声作品",
        "tags": "DLsite, 音声作品, ASMR, 耳舐め, 無声音, 焦らし, 陽向葵ゅか, オトヨメ, セール",
        "sale_info": "30% OFF",
        "official_url": "https://www.dlsite.com/maniax/work/=/product_id/RJ01683949.html",
        "aff_url": "https://dlaf.jp/maniax/dlaf/=/t/n/link/work/aid/Koremiyoonline/id/RJ01683949.html",
        "main_img": "https://img.dlsite.jp/modpub/images2/work/doujin/RJ01684000/RJ01683949_img_main.jpg",
        "sub_imgs": [],
        "chobit_url": "https://chobit.cc/embed/601bf/co0m3vr4?aid=Koremiyoonline",
        "circle": "オトヨメ",
        "catchcopy": "「彼女には、ぜ～んぶお見通しだから…♡」全編“超スロー耳奥舐め”特化！ダウナー彼女による極上焦らし生活",
        "rating": "4.9",
        "summary_quote": "「大人気声優・陽向葵ゅか様が演じるダウナー系あまあま彼女・灯霧みなとちゃん。無声音の吐息とひたすらゆっくり深い耳奥舐めで、脳天がトロトロに溶かされる全肯定耳かき＆耳舐めASMRの最高傑作です！」",
        "pain_points": [
            "テンポの速い耳舐めではなく、じっくりと時間をかけて耳奥の奥まで舌を侵入させられたい",
            "陽向葵ゅか様のダウナーで甘美な無声音囁きに包まれて、日々のストレスを完全に消し去りたい",
            "寸止めと焦らしの連続で、快感を限界まで高めてから蕩けるように射精したい"
        ],
        "highlights": [
            {
                "title": "1. 業界最深峰の没入感！全編“超スロー耳奥舐め”への徹底的なこだわり",
                "desc": "本作最大の魅力は、一切の妥協なく繰り広げられる「超スローテンポ」な耳奥舐め。ぬちゃ…じゅる…と粘膜が擦れ合う音が耳奥深くにダイレクトに響き、じっくりと時間をかけて鼓膜のキワまで舐め解されていく快感は異次元の領域です。"
            },
            {
                "title": "2. 陽向葵ゅか様の真骨頂！全肯定無声音囁きによる精神浄化",
                "desc": "声帯を鳴らさず息だけで語りかける無声音（ウィスパーボイス）が、脳の芯を優しく包み込みます。「お兄ちゃん、今日も頑張ってえらいね…全部みなとに預けていいんだよ♡」という無条件の甘やかしに、聴いているだけで涙が出そうなほどの安らぎが得られます。"
            },
            {
                "title": "3. 焦らされ尽くした後の、濃厚すぎる耳奥舐めえっち本番",
                "desc": "たっぷりとお耳をトロトロにされた後は、耳元で愛を囁かれながらの耳舐め手コキ＆密着ピストン。敏感になりきった耳奥を容赦なくペロペロと攻め立てられ、頭が真っ白になりながら昇天へと導かれます。"
            }
        ],
        "media_type": "video_chobit",
        "gallery_cta_copy": "＼ 陽向葵ゅか様の極上耳奥舐め＆全サンプルトラックはこちら ／",
        "pros": [
            "陽向葵ゅか様の演技力とオトヨメの音響設計が完全一致した、耳舐めASMR屈指の神作",
            "「超スロー」に特化しているため、睡眠導入や深夜のリラックスタイムに最適",
            "長尺収録で大満足のボリューム感と、30%OFFセールによる圧倒的コスパ"
        ],
        "cons": [
            "超スローテンポなため、最初からハイテンポで激しい主観セックス音声を求めている人にはじれったいかも",
            "快感が強すぎて、聴きながら作業をするのには全く向いていません（頭が完全に溶けます）"
        ],
        "closing_text": "今夜は電気を消して、みなとちゃんの優しいお膝の上でお耳を差し出してみませんか？ 30%OFFのこの機会に、極上の脳トロ体験をぜひ味わってください。"
    },
    {
        "file_name": "12_RJ01612664_yukine_revenge.html",
        "dmm_id": "RJ01612664",
        "title": "【15%OFF】『雪音の仇討ち物語』徹底レビュー！故郷を滅ぼされた雪女が5人の仇に挑む和風ダークファンタジーRPG",
        "category": "同人RPG",
        "tags": "DLsite, 同人RPG, 和風, 雪女, 復讐劇, 敗北エロ, 傾世遊庵, セール",
        "sale_info": "15% OFF",
        "official_url": "https://www.dlsite.com/maniax/work/=/product_id/RJ01612664.html",
        "aff_url": "https://dlaf.jp/maniax/dlaf/=/t/n/link/work/aid/Koremiyoonline/id/RJ01612664.html",
        "main_img": "https://img.dlsite.jp/modpub/images2/work/doujin/RJ01613000/RJ01612664_img_main.jpg",
        "sub_imgs": [],
        "chobit_url": "https://chobit.cc/embed/3gno4/6z07oatc?aid=Koremiyoonline",
        "circle": "傾世遊庵",
        "catchcopy": "「仇は5人――」冷たい雪に覆われた復讐の旅路。誇り高き雪女が屈辱の快楽に堕ちていく和風RPG！",
        "rating": "4.8",
        "summary_quote": "「故郷の隠れ里を焼き払われ、一族の仇を討つために立ち上がった雪女の少女・雪音。美しくも過酷な旅の果てに待ち受けるのは、狡猾な仇敵たちによる卑劣な罠と、冷徹な身体を芯から溶かす屈辱の敗北Hでした！」",
        "pain_points": [
            "重厚な和風世界観と、切なくも熱い復讐シナリオを楽しみたい",
            "普段は凛として冷たい雪女ヒロインが、熱い精液と快楽に犯されて屈服するギャップがたまらない",
            "戦闘の駆け引きがしっかり面白い、王道で遊びごたえのあるコマンドバトルRPGをプレイしたい"
        ],
        "highlights": [
            {
                "title": "1. 仇敵5人それぞれに用意された、緻密で過酷な復讐劇",
                "desc": "仇敵たちは武士、陰陽師、盗賊など一筋縄ではいかない強者ばかり。彼らの居城やアジトに潜入し、弱点を探りながら挑むサスペンスフルな展開が物語をグイグイ引っ張ります。"
            },
            {
                "title": "2. 誇り高き雪女が熱狂に呑まれる…屈辱と背徳の敗北・拘束イベント",
                "desc": "戦闘に敗北したり罠にかかると、敵男たちによる容赦ない肉体奉仕の強要へ。氷のように冷たく純潔だった雪音の身体が、荒々しいピストンと濃厚な種付けによって熱を帯び、屈辱に震えながら喘ぎ声を漏らしてしまうシーンの背徳感は絶品です。"
            },
            {
                "title": "3. 氷雪の妖術を駆使する戦略的バトルと美麗ドット＆一枚絵",
                "desc": "敵を凍結させたり冷気を纏って戦う雪音専用の戦闘スキル。傾世遊庵ならではの端正で艶やかな和風グラフィックが、雪音の凛々しさとエロティシズムを見事に際立たせています。"
            }
        ],
        "media_type": "video_chobit",
        "gallery_cta_copy": "＼ 誇り高き雪女の復讐と屈辱の敗北Hの全貌はこちら ／",
        "pros": [
            "和風伝奇×復讐劇×敗北エロという男の王道ファンタジーを最高峰のクオリティで具現化",
            "ストーリーとエロシーンの絡み合いが自然で、シナリオへの没入感が非常に高い",
            "敗北イベントだけでなく、復讐を成し遂げる爽快感もしっかり味わえる"
        ],
        "cons": [
            "和風ダークファンタジーのため、コミカルで明るいコメディ調のRPGを求めている人には重いかも",
            "ヒロインが敵に陵辱される敗北描写が多数あるため、純愛・無傷クリアのみを望む人は注意"
        ],
        "closing_text": "冷たい雪の乙女が、熱い快楽の炎に焼かれていく美しき悲喜劇。15%OFFセールの今、雪音の過酷な仇討ちの旅にぜひ同行してみてください！"
    },
    {
        "file_name": "13_RJ01436394_sacred_cocktail.html",
        "dmm_id": "RJ01436394",
        "title": "『背徳の聖職者とカクテル  ―― 洗脳された祈り子たち』徹底レビュー！怪しげなカクテルで信心深い少女たちを狂わせる背徳洗脳SLG",
        "category": "シミュレーション",
        "tags": "DLsite, シミュレーション, 洗脳, 聖職者, 祈り子, カクテル, 牛乳教会",
        "sale_info": "人気シミュレーション",
        "official_url": "https://www.dlsite.com/maniax/work/=/product_id/RJ01436394.html",
        "aff_url": "https://dlaf.jp/maniax/dlaf/=/t/n/link/work/aid/Koremiyoonline/id/RJ01436394.html",
        "main_img": "https://img.dlsite.jp/modpub/images2/work/doujin/RJ01437000/RJ01436394_img_main.jpg",
        "sub_imgs": [],
        "chobit_url": "https://chobit.cc/embed/7zvte/3un5c9hi?aid=Koremiyoonline",
        "circle": "牛乳教会",
        "catchcopy": "聖なる教会の裏で調合される禁断の媚薬カクテル…純白の祈り子たちが本能剥き出しの肉便器へと堕ちていく！",
        "rating": "4.8",
        "summary_quote": "「教会の聖職者として赴任した主人公。信心深く清らかな祈り子の少女たちに、特殊な効果を持つカクテルを振る舞うことで、彼女たちの理性と倫理観を徐々に狂わせていく背徳の洗脳・調教シミュレーションです！」",
        "pain_points": [
            "信仰心の厚い清純なシスターや少女たちが、理性を失ってメスに堕ちていくギャップを味わいたい",
            "素材を集めてカクテルを調合し、狙った効果で少女たちを変化させるSLGの面白さを楽しみたい",
            "牛乳教会ならではの、圧倒的な肉感とドスケベなアニメーション演出に溺れたい"
        ],
        "highlights": [
            {
                "title": "1. 禁断のカクテル調合システム！少女たちの欲望を自在にコントロール",
                "desc": "催淫、感度上昇、露出狂、完全服従など、調合するカクテルの成分によって祈り子たちの心身が劇的に変貌。「神への祈り」を捧げていたはずの少女たちが、一杯の酒によって息を荒らげ、自分から神父の股間に顔を寄せてくる背徳感がたまりません。"
            },
            {
                "title": "2. 清純から淫乱へ…3段階で狂っていくグラデーション描写",
                "desc": "最初は敬虔で礼儀正しかった少女たちが、カクテルの影響で徐々に服を着崩し、恥じらいを捨て、最後には神ではなく主人公の肉棒だけを信仰する熱狂的な信者へと仕立て上げられていきます。"
            },
            {
                "title": "3. 牛乳教会ブランドが誇る、極上の肉感＆濃厚アニメーション",
                "desc": "むっちりとした太もも、弾力のあるバスト、溢れ出る愛液の描写など、エロアニメーションの破壊力が抜群。聖堂の告解室や祭壇の上で繰り広げられる神聖冒涜の性交シーンは必見のクオリティです。"
            }
        ],
        "media_type": "video_chobit",
        "gallery_cta_copy": "＼ 禁断のカクテルで堕ちる祈り子たちの調教記録はこちら ／",
        "pros": [
            "「カクテル調合×洗脳調教×教会」という背徳的な世界観の構築が完璧",
            "少女たちの性格や反応の変化が細かく描かれており、調教の達成感が非常に高い",
            "牛乳教会作品ならではの圧倒的な肉感とアニメーションのぬるぬる動く滑らかさ"
        ],
        "cons": [
            "清純な少女が完全に変貌していくハードな洗脳シチュエーションのため、純愛派には向かない",
            "カクテルのレシピ開発にある程度の試行錯誤が必要"
        ],
        "closing_text": "神に仕える清らかな祈り子たちを、あなたの調合したカクテルで本能の奴隷へと変貌させてみませんか？ 今夜、秘密の告解室の扉を開いてみてください。"
    }
]

def render_article_html(item):
    # メタデータブロック
    meta_json = json.dumps({
        "title": item["title"],
        "site": "dlsite",
        "category": item["category"],
        "tags": item["tags"],
        "dmm_id": item["dmm_id"],
        "sale_info": item["sale_info"],
        "official_url": item["official_url"]
    }, ensure_ascii=False, indent=2)

    # 見どころ3選HTML生成
    highlights_html = ""
    for idx, h in enumerate(item["highlights"]):
        highlights_html += f"""<div style="margin-bottom: 2rem;">
  <h3 style="color: #059669; border-bottom: 2px solid rgba(5, 150, 105, 0.2); padding-bottom: 0.4rem; font-size: 1.15rem;">{h["title"]}</h3>
  <p style="font-size: 1rem; line-height: 1.8; color: #334155;">
    {h["desc"]}
  </p>
</div>
"""

    # メディアプレイヤー枠
    media_section = ""
    if item["media_type"] == "video_chobit" and "chobit_url" in item:
        cta_copy = item.get("gallery_cta_copy", "＼ 公式ページでサンプル動画・詳細情報をチェック ／")
        media_section = f"""<!-- 5. 埋め込みプレビュー枠と第2CTA -->
<div style="margin: 2.5rem 0; text-align: center;">
  <h3 style="margin-bottom: 0.5rem; font-size: 1.2rem; color: #0f172a;">🎬 公式サンプル動画・ゲームプレイ映像をプレビュー</h3>
  <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 1rem;">※ブラウザ上でそのまま無料再生・動作サンプル動画を確認できます（音声あり）</p>
  <div style="width: 100%; max-width: 680px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.25); background: #000000;">
    <div style="position: relative; width: 100%; padding-top: 61.9%;">
      <iframe src="{item["chobit_url"]}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;" frameborder="0" allowfullscreen loading="lazy" title="{item["title"]} 公式サンプル動画プレイヤー"></iframe>
    </div>
  </div>
  <p style="text-align: center; margin-top: 0.8rem; font-size: 0.85rem;">
    <a href="{item["aff_url"]}" target="_blank" rel="noopener sponsored" style="color: #059669; text-decoration: underline; font-weight: bold;">
      🎬 公式ページで高画質サンプル動画・作品詳細を確認する
    </a>
  </p>
  <!-- 第2CTAボタン -->
  <div style="margin-top: 1.5rem;">
    <p style="font-size: 1rem; color: #334155; margin-bottom: 0.8rem; font-weight: bold;">
      {cta_copy}
    </p>
    <a rel="noopener sponsored" href="{item["aff_url"]}" target="_blank" style="display: inline-block; width: 100%; max-width: 480px; min-height: 52px; line-height: 52px; background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; text-decoration: none; font-weight: bold; font-size: 1.05rem; border-radius: 50px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35); text-align: center;">
      👉 【公式】『{item["title"][:20]}…』サンプル・詳細を見る
    </a>
  </div>
</div>
"""
    elif item["media_type"] == "audio_chobit" and "chobit_url" in item:
        cta_copy = item.get("gallery_cta_copy", "＼ 公式ページで全サンプルトラック・詳細情報をチェック ／")
        media_section = f"""<!-- 5. 埋め込みプレビュー枠と第2CTA -->
<div style="margin: 2.5rem 0; text-align: center;">
  <h3 style="margin-bottom: 0.5rem; font-size: 1.2rem; color: #0f172a;">🎧 公式chobitサンプルボイスプレイヤーをプレビュー</h3>
  <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 1rem;">※ブラウザ上でそのまま無料再生・サンプル音声を確認できます</p>
  <div style="width: 100%; max-width: 640px; margin: 0 auto; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.25); background: #141414;">
    <iframe src="{item["chobit_url"]}" width="100%" height="225" style="display: block; width: 100%; height: 225px; border: none;" frameborder="0" allowfullscreen loading="lazy" title="{item["title"]} 公式chobitサンプルプレイヤー"></iframe>
  </div>
  <p style="text-align: center; margin-top: 0.8rem; font-size: 0.85rem;">
    <a href="{item["aff_url"]}" target="_blank" rel="noopener sponsored" style="color: #059669; text-decoration: underline; font-weight: bold;">
      🎧 公式ページで全サンプルトラック・作品詳細を確認する
    </a>
  </p>
  <!-- 第2CTAボタン -->
  <div style="margin-top: 1.5rem;">
    <p style="font-size: 1rem; color: #334155; margin-bottom: 0.8rem; font-weight: bold;">
      {cta_copy}
    </p>
    <a rel="noopener sponsored" href="{item["aff_url"]}" target="_blank" style="display: inline-block; width: 100%; max-width: 480px; min-height: 52px; line-height: 52px; background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; text-decoration: none; font-weight: bold; font-size: 1.05rem; border-radius: 50px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35); text-align: center;">
      👉 【公式】『{item["title"][:20]}…』サンプル・詳細を見る
    </a>
  </div>
</div>
"""
    elif item["sub_imgs"]:
        # サブ画像ギャラリー
        sub_gallery = ""
        for s_img in item["sub_imgs"][:3]:
            sub_gallery += f"""<p style="text-align: center; margin: 1.5rem 0;">
  <a rel="noopener sponsored" href="{item["aff_url"]}" target="_blank">
    <img src="{s_img}" alt="{item["title"][:20]} 高画質サンプルCG" border="0" class="target_type" style="width: 100%; max-width: 580px; border-radius: 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
  </a>
</p>
"""
        gallery_cta = item.get("gallery_cta_copy", f"＼ 『{item['title'][:20]}…』の全貌はこちら ／")
        media_section = f"""<!-- 5. 高画質サンプルギャラリーと第2CTA -->
<div style="margin: 2.5rem 0; text-align: center;">
  <h3 style="margin-bottom: 0.5rem; font-size: 1.2rem; color: #0f172a;">🖼️ 実際の高解像度サンプルCGギャラリー</h3>
  <p style="font-size: 0.9rem; color: #64748b; margin-bottom: 1rem;">※タップで公式ページの高画質サンプル・追加CGへ移動します</p>
  {sub_gallery}
  <!-- 第2CTAボタン -->
  <div style="margin-top: 1.5rem;">
    <p style="font-size: 1rem; color: #334155; margin-bottom: 0.8rem; font-weight: bold;">
      {gallery_cta}
    </p>
    <a rel="noopener sponsored" href="{item["aff_url"]}" target="_blank" style="display: inline-block; width: 100%; max-width: 480px; min-height: 52px; line-height: 52px; background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; text-decoration: none; font-weight: bold; font-size: 1.05rem; border-radius: 50px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35); text-align: center;">
      👉 【公式】『{item["title"][:20]}…』セール価格・全サンプルを見る
    </a>
  </div>
</div>
"""

    pain_points_html = "\n  ".join([f"<li>{p}</li>" for p in item["pain_points"]])
    pros_html = "\n      ".join([f"<li>{p}</li>" for p in item["pros"]])
    cons_html = "\n      ".join([f"<li>{c}</li>" for c in item["cons"]])

    html = f"""<!-- METADATA
{meta_json}
-->

<!-- 1. メインビジュアル（タップでアフィリエイト遷移） -->
<p style="text-align: center; margin-bottom: 2rem;">
  <a rel="noopener sponsored" href="{item["aff_url"]}" target="_blank">
    <img itemprop="image" src="{item["main_img"]}" alt="{item["title"]} メインビジュアル" border="0" class="target_type" style="width: 100%; max-width: 650px; border-radius: 12px; box-shadow: 0 6px 20px rgba(0,0,0,0.12); display: block; margin: 0 auto;" />
  </a>
</p>

<!-- 2. クイックサマリーカード（ファーストビュー直下） -->
<div style="background: #ffffff; border: 2px solid #059669; border-radius: 16px; padding: 1.5rem; margin-bottom: 2.5rem; box-shadow: 0 4px 16px rgba(5, 150, 105, 0.08);">
  <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">
    <span style="background: #ef4444; color: #ffffff; padding: 0.3rem 0.8rem; border-radius: 6px; font-weight: bold; font-size: 0.85rem;">🔥 {item["sale_info"]}</span>
    <span style="font-size: 1.1rem; color: #f59e0b; font-weight: bold;">★★★★★ {item["rating"]} <span style="font-size: 0.85rem; color: #64748b;">(DLsite高評価作品)</span></span>
  </div>
  <h2 style="font-size: 1.3rem; margin: 0 0 1rem 0; color: #0f172a; line-height: 1.4;">【結論】{item["catchcopy"]}</h2>
  <blockquote style="margin: 0 0 1.2rem 0; padding: 0.8rem 1rem; background: rgba(5, 150, 105, 0.05); border-left: 4px solid #059669; font-size: 0.95rem; line-height: 1.6; color: #334155;">
    {item["summary_quote"]}
  </blockquote>
  <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.8rem; font-size: 0.85rem; margin-bottom: 1.5rem; border-top: 1px dashed #cbd5e1; padding-top: 1rem; color: #334155;">
    <div><strong>🏷️ サークル:</strong> {item["circle"]}</div>
    <div><strong>🎭 ジャンル:</strong> {item["category"]}</div>
    <div><strong>💰 セール情報:</strong> {item["sale_info"]}</div>
    <div><strong>🎮 作品番号:</strong> {item["dmm_id"]}</div>
  </div>
  <!-- 第1CTAボタン -->
  <div style="text-align: center;">
    <a rel="noopener sponsored" href="{item["aff_url"]}" target="_blank" style="display: inline-block; width: 100%; max-width: 480px; min-height: 52px; line-height: 52px; background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; text-decoration: none; font-weight: bold; font-size: 1.05rem; border-radius: 50px; box-shadow: 0 4px 14px rgba(5, 150, 105, 0.35); text-align: center;">
      👉 公式ページで詳細・無料サンプルをチェック
    </a>
  </div>
</div>

<!-- 3. 共感とフェチ提起 -->
<h2 style="font-size: 1.4rem; color: #0f172a; border-left: 5px solid #059669; padding-left: 0.8rem; margin: 2rem 0 1rem 0;">「こんな体験、ずっと求めていませんでしたか？」</h2>
<p style="font-size: 1rem; line-height: 1.8; color: #334155;">
  数ある同人作品の中でも、本作は多くのファンから絶大な支持を集め、ランキング上位へと駆け上がった話題作です。<br>
  単なる表面的なエロにとどまらず、プレイヤーの欲望とフェチを的確に捉えた演出が散りばめられています。
</p>
<ul style="font-size: 0.95rem; line-height: 1.8; color: #334155; margin-bottom: 2rem; padding-left: 1.5rem;">
  {pain_points_html}
</ul>

<!-- 4. 極上見どころ3選 -->
<h2 style="font-size: 1.4rem; color: #0f172a; border-left: 5px solid #059669; padding-left: 0.8rem; margin: 2.5rem 0 1rem 0;">【ここがヤバい】読者を狂わせる極上見どころ3選</h2>

{highlights_html}

{media_section}

<!-- 6. 正直レビュー（Pros / Cons） -->
<h2 style="font-size: 1.4rem; color: #0f172a; border-left: 5px solid #059669; padding-left: 0.8rem; margin: 2.5rem 0 1rem 0;">【正直レビュー】購入前に知っておくべき注意点＆向き不向き</h2>
<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 1.5rem 0;">
  <div style="background: rgba(239, 68, 68, 0.04); border: 1px solid rgba(239, 68, 68, 0.25); border-radius: 12px; padding: 1.2rem;">
    <h3 style="color: #dc2626; margin-top: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 0.4rem;">⚠️ ここだけは注意</h3>
    <ul style="font-size: 0.9rem; line-height: 1.6; padding-left: 1.2rem; color: #334155;">
      {cons_html}
    </ul>
  </div>
  <div style="background: rgba(5, 150, 105, 0.04); border: 1px solid rgba(5, 150, 105, 0.3); border-radius: 12px; padding: 1.2rem;">
    <h3 style="color: #059669; margin-top: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 0.4rem;">💖 ここが確実にぶっ刺さる！</h3>
    <ul style="font-size: 0.9rem; line-height: 1.6; padding-left: 1.2rem; color: #334155;">
      {pros_html}
    </ul>
  </div>
</div>

<!-- 7. 購入正当化と第3CTA（クロージング） -->
<h2 style="font-size: 1.4rem; color: #0f172a; border-left: 5px solid #059669; padding-left: 0.8rem; margin: 2.5rem 0 1rem 0;">【今夜最高の快感を】今すぐ公式で体験すべき理由</h2>
<p style="font-size: 1rem; line-height: 1.8; color: #334155;">
  {item["closing_text"]}
</p>
<div style="text-align: center; margin: 2rem 0;">
  <a rel="noopener sponsored" href="{item["aff_url"]}" target="_blank" style="display: inline-block; width: 100%; max-width: 520px; min-height: 56px; line-height: 56px; background: linear-gradient(135deg, #059669, #047857); color: #ffffff; text-decoration: none; font-weight: bold; font-size: 1.15rem; border-radius: 50px; box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4); text-align: center;">
    👉 【公式】『{item["title"][:20]}…』を今すぐ入手する
  </a>
</div>

<!-- 8. ついで買い・回遊導線 -->
<div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 12px; padding: 1.2rem; margin-top: 3rem;">
  <h3 style="margin-top: 0; font-size: 1.05rem; color: #0f172a;">🔗 あわせてチェックしたい人気作品</h3>
  <p style="font-size: 0.9rem; color: #334155; margin-bottom: 0.8rem;">
    当サイトでは、DLsiteやDMM/FANZAの最新セール情報や、デイリー・ウィークリーランキング上位の注目作品を随時徹底レビューしています！
  </p>
  <p style="margin: 0; font-size: 0.95rem;">
    <a href="/ranking" style="color: #059669; font-weight: bold; text-decoration: none;">
      🏆 【当サイト特設】最新の人気ランキング＆おすすめ作品一覧を見る
    </a>
  </p>
</div>
"""
    return html

def main():
    generated_count = 0
    generated_files = []

    for item in articles_data:
        file_path = os.path.join(articles_dir, item["file_name"])
        content = render_article_html(item)
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(content)
        generated_count += 1
        generated_files.append((item["dmm_id"], item["title"], file_path))
        print(f"✅ 生成完了: [{item['dmm_id']}] {item['file_name']}")

    # content_manager.csv & xlsx のステータスを「記事作成済」に更新
    with open(csv_path, mode="r", encoding="utf-8-sig", errors="ignore") as f:
        rows = list(csv.reader(f))

    wb = openpyxl.load_workbook(excel_path)
    ws = wb.active

    target_rjs = [item["dmm_id"] for item in articles_data]
    for i, r in enumerate(rows):
        if i == 0: continue
        if r[11] in target_rjs:
            r[1] = "記事作成済"
            excel_row = i + 3
            ws.cell(row=excel_row, column=2, value="記事作成済")

    with open(csv_path, mode="w", newline="", encoding="utf-8-sig") as f:
        writer = csv.writer(f)
        writer.writerows(rows)

    wb.save(excel_path)

    print(f"\n🎉 合計 {generated_count} 件の高品位HTML記事を正常に生成しました！")
    print(f"📁 保存先: {articles_dir}")
    print(f"📊 content_manager (Excel/CSV) のステータスを「記事作成済」に更新しました。")

if __name__ == "__main__":
    main()
