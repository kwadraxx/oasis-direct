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

  it("ETH for ERC20 without proxy", () => {
    const from = 'ETH';
    const to = 'DAI';
    const willPay = '1';
    const willReceive = '280';
    const price = '280 ETH/DAI';


    let trade = new Trade().sell(from)(willPay);

    expect(trade).to.receive(`${willReceive}.00000`);

    const finalization = trade
      .acceptTerms()
      .execute();

    const summary = finalization
      .shouldCreateProxy()
      .shouldCommitATrade(willPay, from, willReceive, to);

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

    let trade = new Trade().sell(from)(willPay);

    expect(trade).to.receive(`${willReceive}.00000`);

    let finalization = trade
      .acceptTerms()
      .execute();

    let summary = finalization
      .shouldCreateProxy()
      .shouldCommitATrade(willPay, from, willReceive, to);

    summary.expectProxyBeingCreated();
    summary.expectBought(willReceive, to);
    summary.expectSold(willPay, from);
    summary.expectPriceOf(price);

    newTrade();

    const willReceiveMore = '275';
    const endPrice = '275 ETH/DAI';

    trade = new Trade().sell(from)(willPay);

    expect(trade).to.receive(`${willReceiveMore}.00000`);

    finalization = trade
      .acceptTerms()
      .execute();

    summary = finalization
      .shouldNotCreateProxy()
      .shouldCommitATrade(willPay, from, willReceiveMore, to);

    summary.expectProxyNotBeingCreated();
    summary.expectBought(willReceiveMore, to);
    summary.expectSold(willPay, from);
    summary.expectPriceOf(endPrice);
  });

  it("ERC20 to ETH without proxy and allowance", () => {
    const from = 'DAI';
    const to = 'ETH';
    const willPay = '100';
    const willReceive = '0.33222';
    const price = '301 ETH/DAI';

    const trade = new Trade().sell(from)(willPay);

    expect(trade).to.receive(`${willReceive}`);

    const finalization = trade
      .acceptTerms()
      .execute();

    finalization.shouldCreateProxy();
    expect(finalization.currentTx).to.succeed();

    finalization.shouldSetAllowanceFor(from);
    expect(finalization.currentTx).to.succeed();

    const summary = finalization.shouldCommitATrade(willPay, from, willReceive, to);

    summary.expectBought(willReceive, to);
    summary.expectSold(willPay, from);
    summary.expectPriceOf(price);
  })
});