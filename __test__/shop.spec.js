// 테스트 코드 작성 폴더 구조
const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
chai.use(chaiHttp);
const dotenv = require('dotenv');
dotenv.config();

const url = 'http://localhost:8080';

describe('[GET] admin/shop/all?sort={}&page={}&limit={}', () => {
  it('[GET] 전체 소품샵 : ㄱ,ㄴ,ㄷ순 정렬 - page= 1 , limit = 30', (done) => {
    chai
      .request(url)
      .get('/admin/shop/all')
      .query({ sort: 'alphabet', page: 1, limit: 30 })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('전체 소품샵 조회 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data).to.have.lengthOf(30);
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0]).to.have.all.keys('shopId', 'shopName', 'category', 'image');
        done();
      });
  });
});

describe('[GET] admin/shop/data', () => {
  it('[GET] 전체 소품샵 관련 데이터들 불러오기', (done) => {
    chai
      .request(url)
      .get('/admin/shop/data')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('소품샵 데이터 조회 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('object');
        expect(res.body.data.allShopCount).to.have.lengthOf(1);
        expect(res.body.data.allShopCount[0]).to.have.all.keys('name', 'count');
        expect(res.body.data.allShopCount[0].name).be.a('string');
        expect(res.body.data.allShopCount[0].count).be.a('number');
        expect(res.body.data.allReviewCount).to.have.lengthOf(1);
        expect(res.body.data.allReviewCount[0]).to.have.all.keys('name', 'count');
        expect(res.body.data.allReviewCount[0].name).be.a('string');
        expect(res.body.data.allReviewCount[0].count).be.a('number');
        expect(res.body.data.shopCategoryCount).to.have.lengthOf(6);
        expect(res.body.data.shopCategoryCount[0]).to.have.all.keys('name', 'count');
        expect(res.body.data.shopCategoryCount[0].name).be.a('string');
        expect(res.body.data.shopCategoryCount[0].count).be.a('number');
        expect(res.body.data.shopThemeCount).to.have.lengthOf(4);
        expect(res.body.data.shopThemeCount[0]).to.have.all.keys('name', 'count');
        expect(res.body.data.shopThemeCount[0].name).be.a('string');
        expect(res.body.data.shopThemeCount[0].count).be.a('number');
        expect(res.body.data.shopAreaCount[0]).to.have.all.keys('name', 'count');
        expect(res.body.data.shopAreaCount[0].name).be.a('string');
        expect(res.body.data.shopAreaCount[0].count).be.a('number');
        expect(res.body.data).to.have.all.keys('allShopCount', 'allReviewCount', 'shopCategoryCount', 'shopThemeCount', 'shopAreaCount');
        done();
      });
  });
});

describe('[GET] /shop/:shopId/review/:reviewId', () => {
  it('accesstoken 있을 때', (done) => {
    chai
      .request(url)
      .get('/shop/4/review/4')
      .set('accesstoken', process.env.TEST_TOKEN)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('리뷰 상세 정보 조회 성공');
        expect(res.body).be.a('object');
        expect(res.body.data.shopId).be.a('number');
        expect(res.body.data.shopName).be.a('string');
        expect(res.body.data.category).be.a('array');
        expect(res.body.data.reviewId).be.a('number');
        expect(res.body.data.date).be.a('string');
        expect(res.body.data.likeCount).be.a('number');
        expect(res.body.data.scrapCount).be.a('number');
        expect(res.body.data.content).be.a('string');
        expect(res.body.data.isLiked).be.a('boolean');
        expect(res.body.data.isScraped).be.a('boolean');
        expect(res.body.data.writerName).be.a('string');
        expect(res.body.data.writerThumbnail).be.a('string');
        expect(res.body.data.image).be.a('array');
        expect(res.body.data.item).be.a('array');
        expect(res.body.data.tag).be.a('array');
        expect(res.body.data).to.have.all.keys(
          'shopId',
          'shopName',
          'category',
          'reviewId',
          'date',
          'likeCount',
          'scrapCount',
          'content',
          'isLiked',
          'isScraped',
          'writerName',
          'writerThumbnail',
          'image',
          'item',
          'tag',
        );
        done();
      });
  });

  it('accesstoken 없을 때', (done) => {
    chai
      .request(url)
      .get('/shop/4/review/4')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('리뷰 상세 정보 조회 성공');
        expect(res.body).be.a('object');
        expect(res.body.data.shopId).be.a('number');
        expect(res.body.data.shopName).be.a('string');
        expect(res.body.data.category).be.a('array');
        expect(res.body.data.reviewId).be.a('number');
        expect(res.body.data.date).be.a('string');
        expect(res.body.data.likeCount).be.a('number');
        expect(res.body.data.scrapCount).be.a('number');
        expect(res.body.data.content).be.a('string');
        expect(res.body.data.isLiked).be.a('boolean');
        expect(res.body.data.isScraped).be.a('boolean');
        expect(res.body.data.writerName).be.a('string');
        expect(res.body.data.writerThumbnail).be.a('string');
        expect(res.body.data.image).be.a('array');
        expect(res.body.data.item).be.a('array');
        expect(res.body.data.tag).be.a('array');
        expect(res.body.data).to.have.all.keys(
          'shopId',
          'shopName',
          'category',
          'reviewId',
          'date',
          'likeCount',
          'scrapCount',
          'content',
          'isLiked',
          'isScraped',
          'writerName',
          'writerThumbnail',
          'image',
          'item',
          'tag',
        );
        expect(res.body.data.isLiked).to.deep.equal(false);
        expect(res.body.data.isScraped).to.deep.equal(false);
        done();
      });
  });

  it('파라미터 값이 유효하지 않을 때', (done) => {
    chai
      .request(url)
      .get('/shop/0/review/4')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          status: 400,
          success: false,
          message: '파라미터 값이 잘못되었습니다',
        });
        done();
      });
  });

  it('소품샵 아이디와 리뷰 아이디가 일치하지 않을 때', (done) => {
    chai
      .request(url)
      .get('/shop/4/review/3')
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          status: 400,
          success: false,
          message: '소품샵 아이디와 리뷰 아이디가 일치하지 않습니다',
        });
        done();
      });
  });
});

describe('[GET] /shop?area={}&sort={}', () => {
  it('[GET] 지역별 소품샵 : 인기순 정렬', (done) => {
    chai
      .request(url)
      .get('/shop')
      .query({ area: '서대문구', sort: 'popular' })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('지역별 소품샵 가져오기 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].roadAddress).be.a('string');
        expect(res.body.data[0].landAddress).be.a('string');
        expect(res.body.data[0].time).be.a('string');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0]).to.have.all.keys('shopId', 'shopName', 'category', 'roadAddress', 'landAddress', 'reviewCount', 'time', 'image');
        done();
      });
  });

  it('[GET] 지역별 소품샵 : 내가 저장한 소품샵 정렬 - 저장한 소품샵이 있을 때', (done) => {
    chai
      .request(url)
      .get('/shop')
      .set('accesstoken', process.env.TEST_TOKEN)
      .query({ area: '광진구', sort: 'mysave' })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('지역별 소품샵 가져오기 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].roadAddress).be.a('string');
        expect(res.body.data[0].landAddress).be.a('string');
        expect(res.body.data[0].time).be.a('string');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0]).to.have.all.keys('shopId', 'shopName', 'category', 'roadAddress', 'landAddress', 'reviewCount', 'time', 'image');
        done();
      });
  });

  it('[GET] 지역별 소품샵 : 내가 저장한 소품샵 정렬 - 저장한 소품샵이 없을 때', (done) => {
    chai
      .request(url)
      .get('/shop')
      .set('accesstoken', process.env.TEST_TOKEN)
      .query({ area: '서대문구', sort: 'mysave' })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
          status: 200,
          success: true,
          message: '저장한 소품샵이 없습니다.',
          data: [],
        });
        done();
      });
  });

  it('[GET] 지역별 소품샵 : 내가 저장한 소품샵 정렬 - 로그인 안되어 있을 때', (done) => {
    chai
      .request(url)
      .get('/shop')
      .query({ area: '서대문구', sort: 'mysave' })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body).to.deep.equal({
          status: 401,
          success: false,
          message: '로그인이 필요한 서비스 입니다.',
        });
        done();
      });
  });
});

describe('[GET] /shop?theme={}&sort={}&offset={}&limit={}', () => {
  it('[GET] 테마별 소품샵 : 인기순 정렬 - offset, limit 없음', (done) => {
    chai
      .request(url)
      .get('/shop')
      .query({ theme: '빈티지', sort: 'popular' })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('테마별 소품샵 가져오기 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data).to.have.lengthOf(20);
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0]).to.have.all.keys('shopId', 'shopName', 'category', 'image');
        done();
      });
  });

  it('[GET] 테마별 소품샵 : 인기순 정렬 - offset 2, limit 10', (done) => {
    chai
      .request(url)
      .get('/shop')
      .query({ theme: '아기자기한', sort: 'popular', offset: 2, limit: 10 })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('테마별 소품샵 가져오기 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data).to.have.lengthOf(10);
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0]).to.have.all.keys('shopId', 'shopName', 'category', 'image');
        done();
      });
  });

  it('[GET] 테마별 소품샵 : 리뷰순 정렬 - offset, limit 없음', (done) => {
    chai
      .request(url)
      .get('/shop')
      .query({ theme: '힙한', sort: 'review' })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('테마별 소품샵 가져오기 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data).to.have.lengthOf(20);
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0]).to.have.all.keys('shopId', 'shopName', 'category', 'image');
        done();
      });
  });

  it('[GET] 테마별 소품샵 : 리뷰순 정렬 - offset = 1, limit = 10 ', (done) => {
    chai
      .request(url)
      .get('/shop')
      .query({ theme: '모던한', sort: 'review', offset: 1, limit: 30 })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('테마별 소품샵 가져오기 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data).to.have.lengthOf(30);
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0]).to.have.all.keys('shopId', 'shopName', 'category', 'image');
        done();
      });
  });

  it('[GET] 테마별 소품샵 : theme 쿼리가 없을 때', (done) => {
    chai
      .request(url)
      .get('/shop')
      .query({ sort: 'review' })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body).to.deep.equal({
          status: 400,
          success: false,
          message: '필요한 값이 없습니다',
        });
        done();
      });
  });
});

describe('[GET] /shop/bookmark?sort={}&offset={}&limit={}', () => {
  it('[GET] 저장한 소품샵 : 저장 많은순 정렬 - offset, limit 없음', (done) => {
    chai
      .request(url)
      .get('/shop/bookmark')
      .set('accesstoken', process.env.TEST_TOKEN)
      .query({ sort: 'save' })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('저장한 소품샵 가져오기 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data).to.have.lengthOf(20);
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0]).to.have.all.keys('shopId', 'shopName', 'category', 'image');
        done();
      });
  });

  it('[GET] 저장한 소품샵 : 리뷰 많은순 정렬 - offset = 1, limit = 5', (done) => {
    chai
      .request(url)
      .get('/shop/bookmark')
      .set('accesstoken', process.env.TEST_TOKEN)
      .query({ sort: 'review', offset: 1, limit: 5 })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('저장한 소품샵 가져오기 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data).to.have.lengthOf(5);
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0]).to.have.all.keys('shopId', 'shopName', 'category', 'image');
        done();
      });
  });

  it('[GET] 저장한 소품샵 : 최근 저장순 정렬 - offset = 2, limit = 10', (done) => {
    chai
      .request(url)
      .get('/shop/bookmark')
      .set('accesstoken', process.env.TEST_TOKEN)
      .query({ sort: 'recent', offset: 2, limit: 10 })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('저장한 소품샵 가져오기 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data).to.have.lengthOf(10);
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0]).to.have.all.keys('shopId', 'shopName', 'category', 'image');
        done();
      });
  });

  it('[GET] 저장한 소품샵 : 저장한 소품샵이 없을 때', (done) => {
    chai
      .request(url)
      .get('/shop/bookmark')
      .set('accesstoken', process.env.TEST_TOKEN_ID_5)
      .query({ sort: 'recent' })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body).to.deep.equal({
          status: 200,
          success: true,
          message: '저장한 소품샵이 없습니다.',
          data: [],
        });
        done();
      });
  });

  it('[GET] 저장한 소품샵 : 쿼리값 아무것도 없을 때', (done) => {
    chai
      .request(url)
      .get('/shop/bookmark')
      .set('accesstoken', process.env.TEST_TOKEN)
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('저장한 소품샵 가져오기 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('array');
        expect(res.body.data).to.have.lengthOf(20);
        expect(res.body.data[0].shopId).be.a('number');
        expect(res.body.data[0].shopName).be.a('string');
        expect(res.body.data[0].category).be.a('array');
        expect(res.body.data[0].image).be.a('array');
        expect(res.body.data[0]).to.have.all.keys('shopId', 'shopName', 'category', 'image');
        done();
      });
  });

  it('[GET] 저장한 소품샵 - 로그인 안되어 있을 때', (done) => {
    chai
      .request(url)
      .get('/shop/bookmark')
      .query({ sort: 'recent' })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body).to.deep.equal({
          status: 401,
          success: false,
          message: '로그인이 필요한 서비스 입니다.',
        });
        done();
      });
  });
});


describe('[POST] /shop/bookmark', () => {
  it('[POST] 소품샵 북마크 - 성공', (done) => {
    chai
      .request(url)
      .post('/shop/bookmark')
      .set('accesstoken', process.env.TEST_TOKEN)
      .send({
        shopId: 1,
        isBookmarked: false,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(200);
        expect(res.body.status).to.deep.equal(200);
        expect(res.body.message).to.deep.equal('소품샵 저장 성공');
        expect(res.body).be.a('object');
        expect(res.body.data).be.a('object');
        expect(res.body.data.bookmarkCount).be.a('number');
        done();
      });
  });

  it('[POST] 소품샵 북마크 - 실패: 로그인 안 함', (done) => {
    chai
      .request(url)
      .post('/shop/bookmark')
      .send({
        shopId: 1,
        isBookmarked: false,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(401);
        expect(res.body.status).to.deep.equal(401);
        expect(res.body.message).to.deep.equal('로그인이 필요한 서비스 입니다.');
        done();
      });
  });

  it('[POST] 소품샵 북마크 - shopId없음', (done) => {
    chai
      .request(url)
      .post('/shop/bookmark')
      .set('accesstoken', process.env.TEST_TOKEN)
      .send({
        shopId: 1,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        expect(res.body.message).to.deep.equal('필요한 값이 없습니다');
        done();
      });
  });

  it('[POST] 소품샵 북마크 - isBookmarked 없음', (done) => {
    chai
      .request(url)
      .post('/shop/bookmark')
      .set('accesstoken', process.env.TEST_TOKEN)
      .send({
        isBookmarked: false,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        expect(res.body.message).to.deep.equal('필요한 값이 없습니다');
        done();
      });
  });

  it('[POST] 소품샵 북마크 - shopId 잘못됨', (done) => {
    chai
      .request(url)
      .post('/shop/bookmark')
      .set('accesstoken', process.env.TEST_TOKEN)
      .send({
        shopId: 'dfd',
        isBookmarked: false,
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        expect(res.body.message).to.deep.equal('파라미터 값이 잘못되었습니다');
        done();
      });
  });

  it('[POST] 소품샵 북마크 - isBookmarked 잘못됨', (done) => {
    chai
      .request(url)
      .post('/shop/bookmark')
      .set('accesstoken', process.env.TEST_TOKEN)
      .send({
        shopId: 1,
        isBookmarked: 'dfdfd',
      })
      .end((err, res) => {
        expect(err).to.be.null;
        expect(res).to.have.status(400);
        expect(res.body.status).to.deep.equal(400);
        expect(res.body.message).to.deep.equal('파라미터 값이 잘못되었습니다');
        done();
      });
  });
});
