import React, { Component } from "react";
import web3 from "./web3";
import lottery from "./lottery";
import Header from "./Header";
import Footer from "./Footer";
import Text from "./Text";
import Button from "@material-ui/core/Button";
import SendIcon from "@mui/icons-material/Send";
import QuestionMarkIcon from "@mui/icons-material/QuestionMark";
import TextField from "@material-ui/core/TextField";
import Fab from "@material-ui/core/Fab";

class App extends Component {
  state = {
    manager1: "",
    manager2: "",
    balance: "",
    numberOfBidsCar: "",
    numberOfBidsPhone: "",
    numberOfBidsLaptop: "",
    currentAccount: "",
    messages: "",
    AmIWinner: "",
    newManagerAddress: "",
    declareWinner: "",
    carWinner: "",
    phoneWinner: "",
    laptopWinner: "",
    isDWButtonDisabled: "",
    error: "",
    invalidStage: "",
  };
  async componentDidMount() {
    try {
      const mngr1 = await lottery.methods.owner().call();
      const mngr2 = await lottery.methods.owner2().call();
      const carBids = await lottery.methods.getCarTotalBids().call();
      const phoneBids = await lottery.methods.getPhoneTotalBids().call();
      const laptopBids = await lottery.methods.getLaptopTotalBids().call();
      const balance = await web3.eth.getBalance(lottery.options.address);
      this.setState({
        manager1: mngr1,
        manager2: mngr2,
        balance: balance,
        numberOfBidsCar: carBids,
        numberOfBidsPhone: phoneBids,
        numberOfBidsLaptop: laptopBids,
        messages: "Connect Metamask in Sepolia Network",
        AmIWinner: "...",
        declareWinner: "Before the winners are declared",
        isDWButtonDisabled: false,
        error: false,
        invalidStage: false,
      });
      if (!this.eventListenersSet) {
        this.setupEventListeners();
        this.eventListenersSet = true;
      }
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        const currentAccount = accounts[0];
        this.setState({ messages: "", currentAccount: currentAccount });
      } catch (error) {
        this.setState({ messages: "Metamask has not connected yet" });
      }
    } catch (error) {
      this.setState({ message: "Metamask is not installed" });
    }
    //Έλενγχος εάν το metamask είναι συνδεμένο σε άλλη blockchain
    //----------------------------------------------------------------
    const expectedChainId = "0xaa36a7"; //Sepolia
    const chainId = await window.ethereum.request({ method: "eth_chainId" });
    console.log(chainId);
    if (chainId !== expectedChainId) {
      this.setState({
        messages:
          "Please switch to the Sepolia test network in MetaMask to use this application.",
        isDWButtonDisabled: true,
      });
      return;
    }
    window.ethereum.on("chainChanged", this.handleChainChanged);
    //----------------------------------------------------------------
    if (
      this.state.manager1.toLowerCase().toString() !==
        this.state.currentAccount.toLowerCase().toString() &&
      this.state.manager2.toLowerCase().toString() !==
        this.state.currentAccount.toLowerCase().toString()
    ) {
      this.setState({ isDWButtonDisabled: true });
    }
  }
  handleChainChanged = (chainId) => {
    window.location.reload();
  };
  setupEventListeners() {
    lottery.events.DebugMessage().on("data", async (data) => {
      console.log(data.returnValues.u.toString());
    });
    lottery.events.InvalidStage().on("data", async (data) => {
      const message = data.returnValues.message;
      this.setState({ messages: message, AmIWinner: "", invalidStage: true });
    });
    lottery.events.carWinner().on("data", async (data) => {
      const carWinner = data.returnValues.carWinner.toString();
      this.setState({ carWinner: carWinner });
      console.log(carWinner.toString());
    });
    lottery.events.phoneWinner().on("data", async (data) => {
      const phoneWinner = data.returnValues.phoneWinner.toString();
      this.setState({ phoneWinner: phoneWinner });
      console.log(phoneWinner.toString());
    });
    lottery.events.laptopWinner().on("data", async (data) => {
      const laptopWinner = data.returnValues.laptopWinner.toString();
      this.setState({ laptopWinner: laptopWinner });
      console.log(laptopWinner.toString());
    });

    window.ethereum.on("accountsChanged", (accounts) => {
      const currentAccount = accounts[0];
      this.setState({
        currentAccount: currentAccount,
        AmIWinner: "...",
        messages: "",
      });
      if (
        this.state.manager1.toLowerCase().toString() !==
          this.state.currentAccount.toLowerCase().toString() &&
        this.state.manager2.toLowerCase().toString() !==
          this.state.currentAccount.toLowerCase().toString()
      ) {
        this.setState({ isDWButtonDisabled: true });
      } else {
        this.setState({ isDWButtonDisabled: false });
      }
    });
  }
  handlebidCarButton = async (event) => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const currentAccount = accounts[0];
      this.setState({ currentAccount: currentAccount });
      const gas = 200000;
      const gasPrice = await web3.eth.getGasPrice();
      await lottery.methods.placeCarBid().send({
        from: this.state.currentAccount,
        value: web3.utils.toWei("0.01", "ether"),
        gas,
        gasPrice,
      });

      const carbids = await lottery.methods.getCarTotalBids().call();
      this.setState({ numberOfBidsCar: carbids });
      const balance = await web3.eth.getBalance(lottery.options.address);
      this.setState({
        balance: balance,
        messages: !this.state.invalidStage
          ? "You did a successful bid in a car"
          : "You cant bid after draw",
      });
    } catch (error) {
      console.error("Error placing bid", error);
      const currA = this.state.currentAccount.toString().toLowerCase();
      this.setState({
        messages:
          currA === this.state.manager1.toString().toLowerCase() ||
          currA === this.state.manager2.toString().toLowerCase()
            ? "Managers cant place a bid !"
            : "You cant bid after draw",
      });
    }
  };
  handlebidPhoneButton = async (event) => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const currentAccount = accounts[0];
      this.setState({ currentAccount: currentAccount });

      const gas = 200000;
      const gasPrice = await web3.eth.getGasPrice();
      await lottery.methods.placePhoneBid().send({
        from: this.state.currentAccount,
        value: web3.utils.toWei("0.01", "ether"),
        gas,
        gasPrice,
      });

      const phonebids = await lottery.methods.getPhoneTotalBids().call();
      this.setState({ numberOfBidsPhone: phonebids });
      const balance = await web3.eth.getBalance(lottery.options.address);
      this.setState({
        balance: balance,
        messages: !this.state.invalidStage
          ? "You did a successful bid in a phone"
          : "You cant bid after draw",
      });
    } catch (error) {
      console.error("Error placing bid", error);
      const currA = this.state.currentAccount.toString().toLowerCase();
      this.setState({
        messages:
          currA === this.state.manager1.toString().toLowerCase() ||
          currA === this.state.manager2.toString().toLowerCase()
            ? "Managers cant place a bid !"
            : "You cant bid after draw",
      });
    }
  };
  handlebidLaptopButton = async (event) => {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const currentAccount = accounts[0];
      this.setState({ currentAccount: currentAccount });
      const gas = 200000;
      const gasPrice = await web3.eth.getGasPrice();
      await lottery.methods.placeLaptopBid().send({
        from: this.state.currentAccount,
        value: web3.utils.toWei("0.01", "ether"),
        gas,
        gasPrice,
      });

      const laptopbids = await lottery.methods.getLaptopTotalBids().call();
      this.setState({ numberOfBidsLaptop: laptopbids });
      const balance = await web3.eth.getBalance(lottery.options.address);
      this.setState({
        balance: balance.toString(),
        messages: !this.state.invalidStage
          ? "You did a successful bid in a laptop"
          : "You cant bid after draw",
      });
    } catch (error) {
      console.error("Error placing bid", error);
      const currA = this.state.currentAccount.toString().toLowerCase();
      this.setState({
        messages:
          currA === this.state.manager1.toString().toLowerCase() ||
          currA === this.state.manager2.toString().toLowerCase()
            ? "Managers cant place a bid !"
            : "You cant bid after draw",
      });
    }
  };
  handleAIwinnerButton = async () => {
    try {
      const currA = this.state.currentAccount.toString().toLowerCase();
      const carW = this.state.carWinner.toLowerCase();
      const phoneW = this.state.phoneWinner.toLowerCase();
      const laptopW = this.state.laptopWinner.toLowerCase();
      const o1 = this.state.manager1.toLowerCase();
      const o2 = this.state.manager2.toLowerCase();
      const result = await lottery.methods.amIAWinner().call();
      let result2 = "";
      console.log(result);
      if (currA === carW && currA === phoneW && currA === laptopW) {
        result2 = "Congratulations! you won a car, a phone and a laptop";
      } else if (currA === carW && currA === phoneW) {
        result2 = "Congratulations! you won a car and a phone";
      } else if (currA === carW && currA === laptopW) {
        result2 = "Congratulations! you won a car and a laptop";
      } else if (currA === phoneW && currA === laptopW) {
        result2 = "Congratulations! you won a phone and a laptop";
      } else if (currA === carW) {
        result2 = "Congratulations! you won a car";
      } else if (currA === phoneW) {
        result2 = "Congratulations! you won a phone";
      } else if (currA === laptopW) {
        result2 = "Congratulations! you won a laptop";
      } else if (result === "This Button can clicked only after draw!") {
        result2 = result;
      } else if (currA === o1 || currA === o2) {
        result2 = "Managers cant win an onject!";
      } else {
        result2 = "Unfortunately you didn't win anything";
      }
      this.setState({ AmIWinner: result2 });
    } catch (error) {
      this.setState({ messages: "this button doesnt work" });
    }
  };
  handleDeclareWinnerButton = async () => {
    try {
      if (
        this.state.currentAccount.toLowerCase().toString() ===
          this.state.manager1.toLowerCase().toString() ||
        this.state.currentAccount.toLowerCase().toString() ===
          this.state.manager2.toLowerCase().toString()
      ) {
        await lottery.methods
          .declareWinner()
          .send({ from: this.state.currentAccount });
        this.setState({
          messages: "Declare Winners succesfully",
          declareWinner: "After declare winners!",
        });
      }
    } catch (error) {
      this.setState({
        messages: "Error declaring winners",
      });
    }
  };
  handleWithdrawButton = async () => {
    try {
      await lottery.methods
        .withdraw()
        .send({ from: this.state.currentAccount });
      const balance = await web3.eth.getBalance(lottery.options.address);
      this.setState({
        messages: "Withdraw successfully",
        balance: balance.toString(),
      });
    } catch (error) {
      this.setState({ messages: "Only managers can take the balance !" });
    }
  };
  handleResetButton = async () => {
    try {
      await lottery.methods.reset().send({ from: this.state.currentAccount });
      const balance = await web3.eth.getBalance(lottery.options.address);
      const carBids = await lottery.methods.getCarTotalBids().call();
      const phoneBids = await lottery.methods.getPhoneTotalBids().call();
      const laptopBids = await lottery.methods.getLaptopTotalBids().call();
      this.setState({
        messages: "Reset successfully",
        balance: balance,
        numberOfBidsCar: carBids,
        numberOfBidsPhone: phoneBids,
        numberOfBidsLaptop: laptopBids,
        AmIWinner: "...",
        InvalidStage: false,
        declareWinner: "Before the winners are declared",
        carW: "",
        phoneW: "",
        laptopW: "",
      });
    } catch (error) {
      this.setState({ messages: "Error doing reset" });
    }
  };
  handeInputChange = (event) => {
    this.setState({ newManagerAddress: event.target.value });
  };
  handleNewOwner = async () => {
    clearTimeout(this.errorTimeout);
    try {
      const { newManagerAddress } = this.state;
      const inputValue = newManagerAddress;
      if (inputValue.length !== 42) {
        // 42 is the length of the address
        this.setState({ error: true });
        this.errorTimeout = setTimeout(() => {
          this.setState({ error: false });
        }, 5000);
      } else {
        this.setState({ error: false });
      }
      await lottery.methods
        .setNewOwner(newManagerAddress)
        .send({ from: this.state.currentAccount });
      this.setState({
        manager1: this.state.newManagerAddress,
        messages: "Success setting new manager",
        newManagerAddress: "",
        isDWButtonDisabled: true,
      });
    } catch (error) {
      this.setState({ messages: "Error setting new manager" });
    }
  };
  handleDestroyButton = async () => {
    if (window.confirm("Are you sure you want to destroy the contract?")) {
      try {
        lottery.methods.destroy().send({ from: this.state.currentAccount });
        this.setState({
          messages:
            "Contract destroyed successfully. Nothing works from here on",
        });
      } catch (error) {
        this.setState({ messages: "Error destroying contract" });
      }
    }
  };
  handleRevealButton = async () => {
    this.setState({ messages: "everything is already reveal!" });
  };

  render() {
    return (
      <div className="App">
        <Header />
        <div className="afterHeader">
          <div>
            <p>This contract managed by : </p>
            <ul>
              <li>{this.state.manager1}</li>
              <li>{this.state.manager2}</li>
            </ul>
          </div>
          <div>
            <p>
              The balance of the contract is{" "}
              {web3.utils.fromWei(this.state.balance, "ether")} ether!
            </p>
          </div>
        </div>
        <hr />
        <Text />
        <div className="componentsSection">
          <div>
            <h3>Car</h3>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDVQZPb3ZkdIy3LSO-enXvRPdTqCJrGvbOuA&usqp=CAU"
              alt="car"
            />
            <Fab
              style={{
                backgroundColor: !this.state.isDWButtonDisabled
                  ? "grey"
                  : "#f5ba13",
                textTransform: "none",
                lineHeight: "66px",
              }}
              disabled={!this.state.isDWButtonDisabled}
              onClick={this.handlebidCarButton}
            >
              Bid
            </Fab>
            <p>{this.state.numberOfBidsCar.toString()}</p>
          </div>
          <div>
            <h3>Phone</h3>
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-V0Vt5uFzyAa-cw2qS9b8sWjBAVmy8ya6hA&usqp=CAU"
              alt="phone"
            />
            <Fab
              style={{
                backgroundColor: !this.state.isDWButtonDisabled
                  ? "grey"
                  : "#f5ba13",
                textTransform: "none",
                lineHeight: "66px",
              }}
              disabled={!this.state.isDWButtonDisabled}
              onClick={this.handlebidPhoneButton}
            >
              Bid
            </Fab>
            <p>{this.state.numberOfBidsPhone.toString()}</p>
          </div>
          <div>
            <h3>Laptop</h3>
            <img
              src="data:image/jpeg;base64,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"
              alt="laptop"
            />
            <Fab
              style={{
                backgroundColor: !this.state.isDWButtonDisabled
                  ? "grey"
                  : "#f5ba13",
                textTransform: "none",
                lineHeight: "66px",
              }}
              disabled={!this.state.isDWButtonDisabled}
              onClick={this.handlebidLaptopButton}
            >
              Bid
            </Fab>
            <p>{this.state.numberOfBidsLaptop.toString()}</p>
          </div>
        </div>
        <div className="messagesSection">
          <h3>{this.state.messages}</h3>
        </div>
        <div className="currentAccountSection">
          <label for="currentAccount">Current Account:</label>
          <input
            type="text"
            id="currentAccount"
            name="currentAccount"
            value={this.state.currentAccount}
          />
        </div>
        <div className="buttonSection">
          <div>
            <Button
              onClick={this.handleRevealButton}
              variant="contained"
              color="success"
              size="large"
              style={{ backgroundColor: "#f5ba13" }}
            >
              Reveal
            </Button>
          </div>
          <div>
            <Button
              onClick={this.handleAIwinnerButton}
              variant="contained"
              size="large"
              style={{ backgroundColor: "#f5ba13" }}
              endIcon={<QuestionMarkIcon />}
            >
              Am I Winner
            </Button>
            <p id="AmWp">{this.state.AmIWinner.toString()}</p>
          </div>
          <div id="declareW">
            <Button
              onClick={this.handleDeclareWinnerButton}
              variant="contained"
              size="large"
              style={{
                backgroundColor: this.state.isDWButtonDisabled
                  ? "grey"
                  : "#f5ba13",
              }}
              disabled={this.state.isDWButtonDisabled}
            >
              Declare Winner
            </Button>
            <p style={{ fontWeight: "bold" }}>{this.state.declareWinner}</p>
          </div>
          <div>
            <Button
              onClick={this.handleWithdrawButton}
              variant="contained"
              size="large"
              endIcon={<SendIcon />}
              style={{
                backgroundColor: this.state.isDWButtonDisabled
                  ? "grey"
                  : "#f5ba13",
              }}
              disabled={this.state.isDWButtonDisabled}
            >
              Withdraw
            </Button>
          </div>
          <div>
            <Button
              onClick={this.handleResetButton}
              variant="outlined"
              size="large"
              style={{
                color: this.state.isDWButtonDisabled ? "grey" : "#f5ba13",
                border: this.state.isDWButtonDisabled
                  ? "2px solid grey"
                  : "2px solid #f5ba13",
              }}
              disabled={this.state.isDWButtonDisabled}
            >
              Reset
            </Button>
          </div>
          <div>
            <label for="newManager">Set a new manager:</label>
            <TextField
              type="text"
              id="newManager"
              error={this.state.error}
              label={this.state.error ? "error" : ""}
              helperText={this.state.error ? "Incorrect entry." : ""}
              value={this.state.newManagerAddress}
              onChange={this.handeInputChange}
              variant="outlined"
              style={{ marginBottom: "10px" }}
              disabled={this.state.isDWButtonDisabled}
              fullWidth
            />
            <Button
              onClick={this.handleNewOwner}
              variant="contained"
              size="large"
              style={{
                backgroundColor: this.state.isDWButtonDisabled
                  ? "grey"
                  : "#f5ba13",
              }}
              disabled={this.state.isDWButtonDisabled}
            >
              Set
            </Button>
          </div>
          <div>
            <p>This is a dangerous button!!</p>
            <Button
              onClick={this.handleDestroyButton}
              variant="contained"
              size="small"
              disabled={this.state.isDWButtonDisabled}
              style={{
                backgroundColor: this.state.isDWButtonDisabled
                  ? "grey"
                  : "#ff3d00",
              }}
            >
              Destroy
            </Button>
          </div>
        </div>

        <Footer />
      </div>
    );
  }
}

export default App;
