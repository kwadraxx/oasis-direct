import { visitWithWeb3, tid } from "../utils";
import Trade from "../pages/Trade";

const waitForTradeToFinish = 20000;

const newTrade = () => {
  cy.get(tid("new-trade")).click({timeout: waitForTradeToFinish});
};

context('Selling', () => {
  beforeEach(() => {
    visitWithWeb3();
    cy.get(tid("wallets-continue")).contains("Continue").click();
  });

  it("ETH for ERC20 without PROXY", () => {
    const from = 'ETH';
    const to = 'DAI';
    const willPay = '1';
    const willReceive = '280';
    const price = '280 ETH/DAI';


    let trade = new Trade(from, to, willPay, willReceive).sell();

    expect(trade).to.receive(`${willReceive}.00000`);

    const finalization = trade
      .acceptTerms()
      .execute();

    const summary = finalization
      .shouldCreateProxy()
      .shouldCommitATrade();

    summary.expectProxyBeingCreated();
    summary.expectBought(willReceive, to);
    summary.expectSold(willPay, from);
    summary.expectPriceOf(price)
  });

  it("ETH for ERC20 with proxy", () => {
    const from = 'ETH';
    const to = 'DAI';
    const willPay = '1';
    const willReceive = '280';
    const price = '280 ETH/DAI';

    let trade = new Trade(from, to, willPay, willReceive).sell();

    expect(trade).to.receive(`${willReceive}.00000`);

    let finalization = trade
      .acceptTerms()
      .execute();

    let summary = finalization
      .shouldCreateProxy()
      .shouldCommitATrade();

    summary.expectProxyBeingCreated();
    summary.expectBought(willReceive, to);
    summary.expectSold(willPay, from);
    summary.expectPriceOf(price);

    newTrade();

    const willReceiveMore = '275';
    const endPrice = '275 ETH/DAI';

    trade = new Trade(from, to, willPay, willReceiveMore).sell();

    expect(trade).to.receive(`${willReceiveMore}.00000`);

    finalization = trade
      .acceptTerms()
      .execute();

    summary = finalization
      .shouldNotCreateProxy()
      .shouldCommitATrade();

    summary.expectProxyNotBeingCreated();
    summary.expectBought(willReceiveMore, to);
    summary.expectSold(willPay, from);
    summary.expectPriceOf(endPrice);
  })
});