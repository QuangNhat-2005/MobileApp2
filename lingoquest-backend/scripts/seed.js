const mongoose = require('mongoose');
const Deck = require('../models/Deck');
const Word = require('../models/Word');
require('dotenv').config({ path: './.env' });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Đã kết nối MongoDB để cập nhật dữ liệu...');

        console.log('Bỏ qua việc xóa dữ liệu cũ để bảo toàn tiến độ người dùng.');
        console.log('Bắt đầu cập nhật Decks và Words...');

        const [businessDeck, travelDeck, itDeck] = await Promise.all([
            Deck.findOneAndUpdate({ name: 'Business English' }, { name: 'Business English', description: 'Từ vựng cho môi trường công sở.', iconName: 'briefcase-outline' }, { upsert: true, new: true }),
            Deck.findOneAndUpdate({ name: 'Travel Vocabulary' }, { name: 'Travel Vocabulary', description: 'Từ vựng cần thiết khi đi du lịch.', iconName: 'airplane-outline' }, { upsert: true, new: true }),
            Deck.findOneAndUpdate({ name: 'IT Essentials' }, { name: 'IT Essentials', description: 'Các thuật ngữ công nghệ thông tin cơ bản.', iconName: 'hardware-chip-outline' }, { upsert: true, new: true }),
        ]);
        console.log('Đã cập nhật Decks.');

        const businessDeckId = businessDeck._id;
        const travelDeckId = travelDeck._id;
        const itDeckId = itDeck._id;

        const allWords = [
            // --- Business Words ---
            {
                text: 'Agenda', meaning: 'Chương trình nghị sự', pronunciation: '/əˈdʒen.də/',
                example: 'What is the first item on the agenda?', exampleTranslation: 'Mục đầu tiên trong chương trình nghị sự là gì?',
                imageName: 'agenda.png', deck: businessDeckId,
                synonyms: ['schedule', 'program', 'timetable', 'plan', 'docket'],
                relatedWords: ['meeting', 'item', 'discussion', 'minutes', 'conference'],
                wordForms: [{ form: 'Plural', word: 'agendas' }]
            },
            {
                text: 'Negotiate', meaning: 'Đàm phán', pronunciation: '/nəˈɡoʊ.ʃi.eɪt/',
                example: 'We need to negotiate a new contract.', exampleTranslation: 'Chúng ta cần đàm phán một hợp đồng mới.',
                imageName: 'negotiate.png', deck: businessDeckId,
                synonyms: ['bargain', 'discuss terms', 'deal', 'haggle'],
                antonyms: ['refuse', 'disagree', 'decline'],
                relatedWords: ['contract', 'deal', 'agreement', 'terms', 'settlement'],
                wordForms: [
                    { form: 'Noun', word: 'negotiation' },
                    { form: 'Adjective', word: 'negotiable' },
                    { form: 'Noun', word: 'negotiator' }
                ]
            },
            {
                text: 'Contract', meaning: 'Hợp đồng', pronunciation: '/ˈkɒn.trækt/',
                example: 'Both parties have signed the contract.', exampleTranslation: 'Cả hai bên đã ký hợp đồng.',
                imageName: 'contract.png', deck: businessDeckId,
                synonyms: ['agreement', 'deal', 'pact', 'covenant'],
                relatedWords: ['negotiate', 'sign', 'terms', 'clause', 'legal'],
                wordForms: [{ form: 'Adjective', word: 'contractual' }]
            },
            {
                text: 'Invoice', meaning: 'Hóa đơn', pronunciation: '/ˈɪn.vɔɪs/',
                example: 'Please pay the invoice within 30 days.', exampleTranslation: 'Vui lòng thanh toán hóa đơn trong vòng 30 ngày.',
                imageName: 'invoice.png', deck: businessDeckId,
                synonyms: ['bill', 'statement', 'check'],
                relatedWords: ['payment', 'due date', 'supplier', 'customer', 'amount'],
                wordForms: [{ form: 'Verb', word: 'invoice' }]
            },
            {
                text: 'Marketing', meaning: 'Tiếp thị', pronunciation: '/ˈmɑːr.kɪ.tɪŋ/',
                example: 'Our marketing campaign was very successful.', exampleTranslation: 'Chiến dịch tiếp thị của chúng ta đã rất thành công.',
                imageName: 'marketing.png', deck: businessDeckId,
                synonyms: ['advertising', 'promotion', 'selling'],
                relatedWords: ['brand', 'strategy', 'campaign', 'customer', 'sales'],
                wordForms: [{ form: 'Verb', word: 'market' }]
            },
            {
                text: 'Profit', meaning: 'Lợi nhuận', pronunciation: '/ˈprɒf.ɪt/',
                example: 'The company made a huge profit this year.', exampleTranslation: 'Công ty đã tạo ra lợi nhuận khổng lồ trong năm nay.',
                imageName: 'profit.png', deck: businessDeckId,
                synonyms: ['gain', 'earnings', 'return', 'yield'],
                antonyms: ['loss', 'deficit'],
                relatedWords: ['revenue', 'cost', 'margin', 'business', 'investment'],
                wordForms: [{ form: 'Adjective', word: 'profitable' }, { form: 'Verb', word: 'profit' }]
            },
            {
                text: 'Revenue', meaning: 'Doanh thu', pronunciation: '/ˈrev.ən.juː/',
                example: 'The total revenue for this quarter is impressive.', exampleTranslation: 'Tổng doanh thu của quý này rất ấn tượng.',
                imageName: 'revenue.png', deck: businessDeckId,
                synonyms: ['income', 'takings', 'receipts'],
                relatedWords: ['profit', 'sales', 'earnings', 'turnover', 'financial']
            },
            {
                text: 'Stakeholder', meaning: 'Bên liên quan', pronunciation: '/ˈsteɪkˌhoʊl.dər/',
                example: 'We need to consider all stakeholders in this decision.', exampleTranslation: 'Chúng ta cần xem xét tất cả các bên liên quan trong quyết định này.',
                imageName: 'stakeholder.png', deck: businessDeckId,
                relatedWords: ['shareholder', 'investor', 'employee', 'customer', 'supplier', 'interest']
            },
            {
                text: 'Presentation', meaning: 'Bài thuyết trình', pronunciation: '/ˌprez.ənˈteɪ.ʃən/',
                example: 'She gave an excellent presentation.', exampleTranslation: 'Cô ấy đã có một bài thuyết trình xuất sắc.',
                imageName: 'presentation.png', deck: businessDeckId,
                synonyms: ['speech', 'talk', 'demonstration', 'lecture'],
                relatedWords: ['slide', 'audience', 'speaker', 'Q&A', 'meeting'],
                wordForms: [{ form: 'Verb', word: 'present' }]
            },
            {
                text: 'Deadline', meaning: 'Hạn chót', pronunciation: '/ˈded.laɪn/',
                example: 'The deadline for the project is next Friday.', exampleTranslation: 'Hạn chót cho dự án là thứ Sáu tới.',
                imageName: 'deadline.png', deck: businessDeckId,
                synonyms: ['time limit', 'cutoff date'],
                relatedWords: ['project', 'task', 'submit', 'due', 'schedule']
            },
            {
                text: 'Budget', meaning: 'Ngân sách', pronunciation: '/ˈbʌdʒ.ɪt/',
                example: 'We need to stay within the budget.', exampleTranslation: 'Chúng ta cần phải tuân thủ ngân sách.',
                imageName: 'budget.png', deck: businessDeckId,
                synonyms: ['allowance', 'financial plan', 'funds'],
                relatedWords: ['finance', 'spending', 'cost', 'expense', 'allocate'],
                wordForms: [{ form: 'Adjective', word: 'budgetary' }]
            },
            {
                text: 'Human Resources', meaning: 'Nhân sự', pronunciation: '/ˌhjuː.mən rɪˈsɔːr.sɪz/',
                example: 'Contact Human Resources for your contract details.', exampleTranslation: 'Liên hệ phòng Nhân sự để biết chi tiết hợp đồng của bạn.',
                imageName: 'hr.png', deck: businessDeckId,
                synonyms: ['HR', 'personnel department', 'staffing'],
                relatedWords: ['employee', 'recruitment', 'hiring', 'payroll', 'benefits']
            },
            {
                text: 'Customer', meaning: 'Khách hàng', pronunciation: '/ˈkʌs.tə.mər/',
                example: 'The customer is always right.', exampleTranslation: 'Khách hàng luôn luôn đúng.',
                imageName: 'customer.png', deck: businessDeckId,
                synonyms: ['client', 'patron', 'consumer', 'buyer'],
                relatedWords: ['service', 'support', 'satisfaction', 'feedback', 'purchase']
            },
            {
                text: 'Supplier', meaning: 'Nhà cung cấp', pronunciation: '/səˈplaɪ.ər/',
                example: 'We have a good relationship with our supplier.', exampleTranslation: 'Chúng tôi có mối quan hệ tốt với nhà cung cấp của mình.',
                imageName: 'supplier.png', deck: businessDeckId,
                synonyms: ['vendor', 'provider', 'purveyor'],
                relatedWords: ['supply chain', 'invoice', 'order', 'procurement', 'goods'],
                wordForms: [{ form: 'Verb', word: 'supply' }]
            },
            {
                text: 'Merger', meaning: 'Sáp nhập', pronunciation: '/ˈmɜːr.dʒər/',
                example: 'The merger of the two companies was announced yesterday.', exampleTranslation: 'Việc sáp nhập hai công ty đã được công bố ngày hôm qua.',
                imageName: 'merger.png', deck: businessDeckId,
                synonyms: ['amalgamation', 'consolidation', 'fusion'],
                relatedWords: ['acquisition', 'company', 'business', 'deal', 'corporate'],
                wordForms: [{ form: 'Verb', word: 'merge' }]
            },
            {
                text: 'Acquisition', meaning: 'Mua lại', pronunciation: '/ˌæk.wɪˈzɪʃ.ən/',
                example: 'This is the company\'s biggest acquisition to date.', exampleTranslation: 'Đây là thương vụ mua lại lớn nhất của công ty cho đến nay.',
                imageName: 'acquisition.png', deck: businessDeckId,
                synonyms: ['takeover', 'buyout', 'purchase'],
                relatedWords: ['merger', 'company', 'business', 'deal', 'investment'],
                wordForms: [{ form: 'Verb', word: 'acquire' }]
            },
            {
                text: 'Brand', meaning: 'Thương hiệu', pronunciation: '/brænd/',
                example: 'Building a strong brand is crucial for success.', exampleTranslation: 'Xây dựng một thương hiệu mạnh là rất quan trọng để thành công.',
                imageName: 'brand.png', deck: businessDeckId,
                synonyms: ['trademark', 'logo', 'identity'],
                relatedWords: ['marketing', 'reputation', 'image', 'loyalty', 'recognition'],
                wordForms: [{ form: 'Adjective', word: 'branded' }]
            },
            {
                text: 'Strategy', meaning: 'Chiến lược', pronunciation: '/ˈstræt.ə.dʒi/',
                example: 'We need a new marketing strategy.', exampleTranslation: 'Chúng ta cần một chiến lược tiếp thị mới.',
                imageName: 'strategy.png', deck: businessDeckId,
                synonyms: ['plan', 'tactic', 'approach', 'blueprint'],
                relatedWords: ['marketing', 'business', 'goal', 'objective', 'planning'],
                wordForms: [{ form: 'Adjective', word: 'strategic' }, { form: 'Noun', word: 'strategist' }]
            },
            {
                text: 'Feedback', meaning: 'Phản hồi', pronunciation: '/ˈfiːd.bæk/',
                example: 'We received positive feedback from our clients.', exampleTranslation: 'Chúng tôi đã nhận được phản hồi tích cực từ khách hàng.',
                imageName: 'feedback.png', deck: businessDeckId,
                synonyms: ['response', 'reaction', 'critique', 'input'],
                relatedWords: ['customer', 'survey', 'review', 'improvement', 'suggestion']
            },
            {
                text: 'Productivity', meaning: 'Năng suất', pronunciation: '/ˌprɒd.ʌkˈtɪv.ə.ti/',
                example: 'The new software has increased our productivity.', exampleTranslation: 'Phần mềm mới đã làm tăng năng suất của chúng tôi.',
                imageName: 'productivity.png', deck: businessDeckId,
                synonyms: ['efficiency', 'output', 'performance'],
                relatedWords: ['workflow', 'time management', 'efficiency', 'tools', 'employee'],
                wordForms: [{ form: 'Adjective', word: 'productive' }]
            },

            // --- Travel Words ---
            {
                text: 'Itinerary', meaning: 'Lịch trình', pronunciation: '/aɪˈtɪn.ə.rer.i/',
                example: 'Our itinerary includes a visit to the museum.', exampleTranslation: 'Lịch trình của chúng tôi bao gồm một chuyến thăm bảo tàng.',
                imageName: 'itinerary.png', deck: travelDeckId,
                synonyms: ['schedule', 'plan', 'route', 'program'],
                relatedWords: ['travel', 'trip', 'journey', 'destination', 'booking']
            },
            {
                text: 'Boarding pass', meaning: 'Thẻ lên máy bay', pronunciation: '/ˈbɔːr.dɪŋ ˌpæs/',
                example: 'Please show your boarding pass at the gate.', exampleTranslation: 'Vui lòng xuất trình thẻ lên máy bay của bạn tại cổng.',
                imageName: 'boarding-pass.png', deck: travelDeckId,
                relatedWords: ['flight', 'gate', 'seat', 'airline', 'airport']
            },
            {
                text: 'Passport', meaning: 'Hộ chiếu', pronunciation: '/ˈpæs.pɔːrt/',
                example: 'Don\'t forget to bring your passport.', exampleTranslation: 'Đừng quên mang theo hộ chiếu của bạn.',
                imageName: 'passport.png', deck: travelDeckId,
                relatedWords: ['visa', 'customs', 'immigration', 'ID', 'travel document']
            },
            {
                text: 'Visa', meaning: 'Thị thực', pronunciation: '/ˈviː.zə/',
                example: 'You need a visa to enter this country.', exampleTranslation: 'Bạn cần thị thực để nhập cảnh vào quốc gia này.',
                imageName: 'visa.png', deck: travelDeckId,
                relatedWords: ['passport', 'embassy', 'immigration', 'permit', 'entry']
            },
            {
                text: 'Luggage', meaning: 'Hành lý', pronunciation: '/ˈlʌɡ.ɪdʒ/',
                example: 'How many pieces of luggage do you have?', exampleTranslation: 'Bạn có bao nhiêu kiện hành lý?',
                imageName: 'luggage.png', deck: travelDeckId,
                synonyms: ['baggage', 'suitcase', 'bags'],
                relatedWords: ['check-in', 'carousel', 'lost and found', 'carry-on']
            },
            {
                text: 'Reservation', meaning: 'Đặt chỗ trước', pronunciation: '/ˌrez.əˈveɪ.ʃən/',
                example: 'I have a reservation under the name of Smith.', exampleTranslation: 'Tôi có một suất đặt trước dưới tên Smith.',
                imageName: 'reservation.png', deck: travelDeckId,
                synonyms: ['booking', 'pre-arrangement'],
                antonyms: ['cancellation', 'walk-in'],
                relatedWords: ['hotel', 'flight', 'restaurant', 'confirm', 'cancel'],
                wordForms: [{ form: 'Verb', word: 'reserve' }]
            },
            {
                text: 'Accommodation', meaning: 'Chỗ ở', pronunciation: '/əˌkɒm.əˈdeɪ.ʃən/',
                example: 'We have found cheap accommodation for our trip.', exampleTranslation: 'Chúng tôi đã tìm được chỗ ở giá rẻ cho chuyến đi của mình.',
                imageName: 'accommodation.png', deck: travelDeckId,
                synonyms: ['lodging', 'housing', 'quarters'],
                relatedWords: ['hotel', 'hostel', 'guesthouse', 'Airbnb', 'rent'],
                wordForms: [{ form: 'Verb', word: 'accommodate' }]
            },
            {
                text: 'Destination', meaning: 'Điểm đến', pronunciation: '/ˌdes.tɪˈneɪ.ʃən/',
                example: 'Our final destination is Paris.', exampleTranslation: 'Điểm đến cuối cùng của chúng tôi là Paris.',
                imageName: 'destination.png', deck: travelDeckId,
                synonyms: ['end-point', 'goal', 'target'],
                antonyms: ['origin', 'starting point', 'source'],
                relatedWords: ['journey', 'arrival', 'itinerary', 'location']
            },
            {
                text: 'Souvenir', meaning: 'Quà lưu niệm', pronunciation: '/ˌsuː.vəˈnɪər/',
                example: 'I bought a small souvenir for my sister.', exampleTranslation: 'Tôi đã mua một món quà lưu niệm nhỏ cho em gái tôi.',
                imageName: 'souvenir.png', deck: travelDeckId,
                synonyms: ['memento', 'keepsake', 'reminder'],
                relatedWords: ['gift', 'shop', 'tourist', 'local', 'craft']
            },
            {
                text: 'Currency', meaning: 'Tiền tệ', pronunciation: '/ˈkʌr.ən.si/',
                example: 'What is the local currency?', exampleTranslation: 'Đơn vị tiền tệ địa phương là gì?',
                imageName: 'currency.png', deck: travelDeckId,
                synonyms: ['money', 'cash', 'coinage'],
                relatedWords: ['exchange rate', 'bank', 'dollar', 'euro', 'yen']
            },
            {
                text: 'Customs', meaning: 'Hải quan', pronunciation: '/ˈkʌs.təmz/',
                example: 'We had to go through customs at the airport.', exampleTranslation: 'Chúng tôi đã phải đi qua hải quan tại sân bay.',
                imageName: 'customs.png', deck: travelDeckId,
                relatedWords: ['border', 'immigration', 'duty', 'declaration', 'passport']
            },
            {
                text: 'Departure', meaning: 'Sự khởi hành', pronunciation: '/dɪˈpɑːr.tʃər/',
                example: 'Our departure time is 10:30 AM.', exampleTranslation: 'Thời gian khởi hành của chúng tôi là 10:30 sáng.',
                imageName: 'departure.png', deck: travelDeckId,
                synonyms: ['leaving', 'exit'],
                antonyms: ['arrival', 'coming'],
                relatedWords: ['departure lounge', 'gate', 'flight', 'takeoff', 'schedule'],
                wordForms: [{ form: 'Verb', word: 'depart' }]
            },
            {
                text: 'Arrival', meaning: 'Sự đến nơi', pronunciation: '/əˈraɪ.vəl/',
                example: 'The arrival of the train was delayed.', exampleTranslation: 'Chuyến tàu đã đến muộn.',
                imageName: 'arrival.png', deck: travelDeckId,
                synonyms: ['coming', 'appearance'],
                antonyms: ['departure', 'leaving'],
                relatedWords: ['arrival hall', 'gate', 'flight', 'landing', 'schedule'],
                wordForms: [{ form: 'Verb', word: 'arrive' }]
            },
            {
                text: 'Layover', meaning: 'Quá cảnh', pronunciation: '/ˈleɪˌoʊ.vər/',
                example: 'We have a three-hour layover in Dubai.', exampleTranslation: 'Chúng tôi có một chặng dừng quá cảnh ba giờ ở Dubai.',
                imageName: 'layover.png', deck: travelDeckId,
                synonyms: ['stopover', 'break', 'transit'],
                relatedWords: ['connecting flight', 'airport', 'wait', 'delay']
            },
            {
                text: 'Check-in', meaning: 'Làm thủ tục', pronunciation: '/ˈtʃek.ɪn/',
                example: 'You can check-in online 24 hours before your flight.', exampleTranslation: 'Bạn có thể làm thủ tục trực tuyến 24 giờ trước chuyến bay.',
                imageName: 'check-in.png', deck: travelDeckId,
                antonyms: ['check-out'],
                relatedWords: ['desk', 'counter', 'online', 'luggage', 'boarding pass'],
                wordForms: [{ form: 'Verb', word: 'check in' }]
            },
            {
                text: 'Hotel', meaning: 'Khách sạn', pronunciation: '/hoʊˈtel/',
                example: 'We are staying at a five-star hotel.', exampleTranslation: 'Chúng tôi đang ở tại một khách sạn năm sao.',
                imageName: 'hotel.png', deck: travelDeckId,
                synonyms: ['inn', 'motel', 'lodge', 'guesthouse'],
                relatedWords: ['room', 'reception', 'booking', 'reservation', 'concierge']
            },
            {
                text: 'Excursion', meaning: 'Chuyến du ngoạn', pronunciation: '/ɪkˈskɜːr.ʒən/',
                example: 'We went on an excursion to the nearby islands.', exampleTranslation: 'Chúng tôi đã đi một chuyến du ngoạn đến các hòn đảo gần đó.',
                imageName: 'excursion.png', deck: travelDeckId,
                synonyms: ['trip', 'outing', 'jaunt', 'tour'],
                relatedWords: ['guide', 'sightseeing', 'day trip', 'activity', 'adventure']
            },
            {
                text: 'Backpack', meaning: 'Ba lô', pronunciation: '/ˈbæk.pæk/',
                example: 'He travels around the world with just a backpack.', exampleTranslation: 'Anh ấy đi du lịch khắp thế giới chỉ với một chiếc ba lô.',
                imageName: 'backpack.png', deck: travelDeckId,
                synonyms: ['rucksack', 'knapsack'],
                relatedWords: ['hike', 'travel', 'backpacker', 'strap', 'camping'],
                wordForms: [{ form: 'Verb', word: 'backpack' }, { form: 'Noun', word: 'backpacking' }]
            },
            {
                text: 'Embassy', meaning: 'Đại sứ quán', pronunciation: '/ˈem.bə.si/',
                example: 'You can get a new passport at the embassy.', exampleTranslation: 'Bạn có thể làm hộ chiếu mới tại đại sứ quán.',
                imageName: 'embassy.png', deck: travelDeckId,
                relatedWords: ['consulate', 'diplomat', 'ambassador', 'visa', 'passport', 'government']
            },
            // --- IT Words ---
            {
                text: 'Database', meaning: 'Cơ sở dữ liệu', pronunciation: '/ˈdeɪ.tə.beɪs/',
                example: 'The customer information is stored in a database.', exampleTranslation: 'Thông tin khách hàng được lưu trữ trong một cơ sở dữ liệu.',
                imageName: 'database.png', deck: itDeckId,
                synonyms: ['data store', 'repository', 'DB'],
                relatedWords: ['server', 'query', 'SQL', 'NoSQL', 'data', 'table', 'record']
            },
            {
                text: 'Algorithm', meaning: 'Thuật toán', pronunciation: '/ˈæl.ɡə.rɪ.ðəm/',
                example: 'This search engine uses a complex algorithm.', exampleTranslation: 'Công cụ tìm kiếm này sử dụng một thuật toán phức tạp.',
                imageName: 'algorithm.png', deck: itDeckId,
                synonyms: ['procedure', 'process', 'formula', 'set of rules'],
                relatedWords: ['code', 'logic', 'computation', 'data structure', 'developer', 'efficiency'],
                wordForms: [{ form: 'Adjective', word: 'algorithmic' }]
            },
            {
                text: 'Software', meaning: 'Phần mềm', pronunciation: '/ˈsɒft.weər/',
                example: 'You need to install the new software.', exampleTranslation: 'Bạn cần cài đặt phần mềm mới.',
                imageName: 'software.png', deck: itDeckId,
                synonyms: ['application', 'program', 'app'],
                antonyms: ['hardware'],
                relatedWords: ['operating system', 'developer', 'code', 'update', 'install']
            },
            {
                text: 'Hardware', meaning: 'Phần cứng', pronunciation: '/ˈhɑːrd.weər/',
                example: 'The problem is with the hardware, not the software.', exampleTranslation: 'Vấn đề nằm ở phần cứng, không phải phần mềm.',
                imageName: 'hardware.png', deck: itDeckId,
                synonyms: ['equipment', 'machinery', 'components'],
                antonyms: ['software'],
                relatedWords: ['CPU', 'RAM', 'motherboard', 'GPU', 'computer']
            },
            {
                text: 'Network', meaning: 'Mạng lưới', pronunciation: '/ˈnet.wɜːrk/',
                example: 'The office network is down.', exampleTranslation: 'Mạng văn phòng đang bị sập.',
                imageName: 'network.png', deck: itDeckId,
                relatedWords: ['internet', 'router', 'switch', 'LAN', 'WAN', 'firewall', 'bandwidth']
            },
            {
                text: 'Server', meaning: 'Máy chủ', pronunciation: '/ˈsɜːr.vər/',
                example: 'The website is hosted on a dedicated server.', exampleTranslation: 'Trang web được lưu trữ trên một máy chủ chuyên dụng.',
                imageName: 'server.png', deck: itDeckId,
                antonyms: ['client'],
                relatedWords: ['database', 'hosting', 'cloud', 'network', 'data center']
            },
            {
                text: 'Firewall', meaning: 'Tường lửa', pronunciation: '/ˈfaɪər.wɔːl/',
                example: 'A firewall helps protect your computer from hackers.', exampleTranslation: 'Tường lửa giúp bảo vệ máy tính của bạn khỏi tin tặc.',
                imageName: 'firewall.png', deck: itDeckId,
                relatedWords: ['security', 'network', 'hacker', 'malware', 'protection', 'block']
            },
            {
                text: 'Cloud computing', meaning: 'Điện toán đám mây', pronunciation: '/ˌklaʊd kəmˈpjuː.tɪŋ/',
                example: 'We store our data using cloud computing services.', exampleTranslation: 'Chúng tôi lưu trữ dữ liệu của mình bằng các dịch vụ điện toán đám mây.',
                imageName: 'cloud.png', deck: itDeckId,
                relatedWords: ['server', 'storage', 'database', 'AWS', 'Azure', 'Google Cloud']
            },
            {
                text: 'Cybersecurity', meaning: 'An ninh mạng', pronunciation: '/ˌsaɪ.bər.səˈkjʊr.ə.ti/',
                example: 'Cybersecurity is a growing concern for businesses.', exampleTranslation: 'An ninh mạng là một mối quan tâm ngày càng tăng đối với các doanh nghiệp.',
                imageName: 'cybersecurity.png', deck: itDeckId,
                synonyms: ['information security', 'IT security'],
                relatedWords: ['firewall', 'encryption', 'hacker', 'malware', 'virus', 'data breach']
            },
            {
                text: 'Encryption', meaning: 'Mã hóa', pronunciation: '/ɪnˈkrɪp.ʃən/',
                example: 'Encryption is used to protect sensitive data.', exampleTranslation: 'Mã hóa được sử dụng để bảo vệ dữ liệu nhạy cảm.',
                imageName: 'encryption.png', deck: itDeckId,
                antonyms: ['decryption'],
                relatedWords: ['security', 'data', 'password', 'algorithm', 'key', 'decrypt'],
                wordForms: [{ form: 'Verb', word: 'encrypt' }]
            },
            {
                text: 'Bandwidth', meaning: 'Băng thông', pronunciation: '/ˈbænd.wɪdθ/',
                example: 'We need more bandwidth to support all our users.', exampleTranslation: 'Chúng tôi cần thêm băng thông để hỗ trợ tất cả người dùng.',
                imageName: 'bandwidth.png', deck: itDeckId,
                relatedWords: ['network', 'internet', 'speed', 'download', 'upload', 'data']
            },
            {
                text: 'Operating System', meaning: 'Hệ điều hành', pronunciation: '/ˈɒp.ər.eɪ.tɪŋ ˌsɪs.təm/',
                example: 'Windows is a popular operating system.', exampleTranslation: 'Windows là một hệ điều hành phổ biến.',
                imageName: 'os.png', deck: itDeckId,
                synonyms: ['OS'],
                relatedWords: ['software', 'Windows', 'macOS', 'Linux', 'Android', 'iOS', 'kernel']
            },
            {
                text: 'Application', meaning: 'Ứng dụng', pronunciation: '/ˌæp.lɪˈkeɪ.ʃən/',
                example: 'He is developing a new mobile application.', exampleTranslation: 'Anh ấy đang phát triển một ứng dụng di động mới.',
                imageName: 'application.png', deck: itDeckId,
                synonyms: ['app', 'software', 'program'],
                relatedWords: ['user interface', 'developer', 'code', 'install', 'mobile', 'web']
            },
            {
                text: 'User Interface', meaning: 'Giao diện người dùng', pronunciation: '/ˌjuː.zər ˈɪn.tə.feɪs/',
                example: 'The application has a very friendly user interface.', exampleTranslation: 'Ứng dụng có một giao diện người dùng rất thân thiện.',
                imageName: 'ui.png', deck: itDeckId,
                synonyms: ['UI', 'layout', 'design'],
                relatedWords: ['UX', 'user experience', 'button', 'menu', 'design', 'application']
            },
            {
                text: 'Bug', meaning: 'Lỗi (phần mềm)', pronunciation: '/bʌɡ/',
                example: 'I think I found a bug in the software.', exampleTranslation: 'Tôi nghĩ tôi đã tìm thấy một lỗi trong phần mềm.',
                imageName: 'bug.png', deck: itDeckId,
                synonyms: ['error', 'flaw', 'glitch', 'defect'],
                relatedWords: ['debug', 'fix', 'patch', 'software', 'code', 'developer', 'testing']
            },
            {
                text: 'Code', meaning: 'Mã (lập trình)', pronunciation: '/koʊd/',
                example: 'He writes clean and efficient code.', exampleTranslation: 'Anh ấy viết mã sạch và hiệu quả.',
                imageName: 'code.png', deck: itDeckId,
                synonyms: ['source code', 'script', 'program'],
                relatedWords: ['developer', 'algorithm', 'bug', 'debug', 'syntax', 'language'],
                wordForms: [{ form: 'Verb', word: 'code' }, { form: 'Noun', word: 'coder' }]
            },
            {
                text: 'Developer', meaning: 'Lập trình viên', pronunciation: '/dɪˈvel.ə.pər/',
                example: 'She is a senior software developer.', exampleTranslation: 'Cô ấy là một lập trình viên phần mềm cao cấp.',
                imageName: 'developer.png', deck: itDeckId,
                synonyms: ['programmer', 'coder', 'software engineer'],
                relatedWords: ['code', 'software', 'application', 'bug', 'debug', 'framework']
            },
            {
                text: 'Deployment', meaning: 'Triển khai', pronunciation: '/dɪˈplɔɪ.mənt/',
                example: 'The deployment of the new version is scheduled for tonight.', exampleTranslation: 'Việc triển khai phiên bản mới được lên lịch vào tối nay.',
                imageName: 'deployment.png', deck: itDeckId,
                synonyms: ['release', 'launch', 'rollout'],
                relatedWords: ['server', 'production', 'staging', 'version', 'release'],
                wordForms: [{ form: 'Verb', word: 'deploy' }]
            },
            {
                text: 'Framework', meaning: 'Nền tảng (lập trình)', pronunciation: '/ˈfreɪm.wɜːrk/',
                example: 'React is a popular JavaScript framework.', exampleTranslation: 'React là một framework JavaScript phổ biến.',
                imageName: 'framework.png', deck: itDeckId,
                relatedWords: ['library', 'React', 'Angular', 'Vue', 'code', 'developer', 'architecture']
            },
        ];

        await Promise.all(allWords.map(wordData =>
            Word.findOneAndUpdate(
                { text: wordData.text, deck: wordData.deck },
                { $set: wordData },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            )
        ));

        console.log('Đã cập nhật Words và Connections data thành công.');

    } catch (error) {
        console.error('Lỗi khi seed dữ liệu:', error);
    } finally {
        await mongoose.connection.close();
        console.log('Đã đóng kết nối MongoDB.');
    }
};

seedData();