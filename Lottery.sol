// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lottery {
      event BidPlaced(address indexed bidder, string message);
      event InvalidStage(string message);
      event ContractDestroyed(address indexed owner);
      event DebugMessage(uint u, string s);
      event carWinner(address carWinner);
      event phoneWinner(address phoneWinner);
      event laptopWinner(address laptopWinner);

    uint public constant NUM_LOTTERIES = 3;

    struct Bidder{
        address bidderAddress;
        uint8[NUM_LOTTERIES] bids;
        string[] totalWinnings;
    }

    struct Item{
        string name;
        address[] addressesOfBiders;
        uint totalBids ;
        address winner ; 
    }

    address public owner ;
    address public owner2 ; 
    Bidder[] public allBiders;

    enum Stage {preDraw, afterDraw}
    Stage stage;
    

    Item public car;
    Item public phone;
    Item public laptop;


    constructor() {
        owner = msg.sender;
        owner2 = 0x153dfef4355E823dCB0FCc76Efe942BefCa86477;
        stage = Stage.preDraw ; 

        car = Item({
            name: "car",
            addressesOfBiders: new address[](0),
            totalBids:0,
            winner: address(0)
        });
        phone = Item({
            name: "phone",
            addressesOfBiders: new address[](0),
            totalBids:0,
            winner: address(0)
        });
        laptop = Item({
            name: "laptop",
            addressesOfBiders: new address[](0),
            totalBids:0,
            winner: address(0)
        });
    }

    modifier onlyOwner() { 
        require(msg.sender == owner || msg.sender == owner2 ,"Not the owner");
        _; 
    }
    modifier moneyExists(uint requiredAmount){ 
        require(msg.value >= requiredAmount, "Minimum bid amount is 0.01 ether");
        _;
    }
    modifier trackOwner(address adr){   
        require(adr != owner && adr != owner2,"Not allowd to the access to the owner");
        _;
    }
    modifier checkStage(){
        if(stage != Stage.preDraw){
            emit InvalidStage("already did a draw");
            require(stage == Stage.preDraw,"the draw has taken place");
            return;
        }
        _;
    }



    function placeCarBid() external payable moneyExists(0.01 ether) trackOwner(msg.sender) checkStage() {
        car.addressesOfBiders.push(msg.sender);
        car.totalBids ++;
        emit BidPlaced(msg.sender, "You did a succesfull Bid is a car!!");
        bool flag = false ; 
        for(uint i =0; i<allBiders.length;i++){
            if(keccak256(abi.encodePacked(msg.sender)) == keccak256(abi.encodePacked(allBiders[i].bidderAddress))){
                flag = true;
                allBiders[i].bids[0] =  allBiders[i].bids[0] + 1 ;
            }
        }
        if(flag == false){
            Bidder memory newBidder = Bidder({
                    bidderAddress: msg.sender,
                    bids: [1,0,0],
                    totalWinnings:new string[](0)
            });
            allBiders.push(newBidder);
        }
    }

    function placePhoneBid() external payable moneyExists(0.01 ether) trackOwner(msg.sender)  checkStage(){
        phone.addressesOfBiders.push(msg.sender);
        phone.totalBids ++;
        emit BidPlaced(msg.sender, "You did a succesfull Bid is a phone!!");
        bool flag = false ; 
        for(uint i =0; i<allBiders.length;i++){
            if(keccak256(abi.encodePacked(msg.sender)) == keccak256(abi.encodePacked(allBiders[i].bidderAddress))){
                flag = true;
                allBiders[i].bids[1] =  allBiders[i].bids[1] + 1 ;
            }
        }
        if(flag == false){
            Bidder memory newBidder = Bidder({
                    bidderAddress: msg.sender,
                    bids: [0,1,0] ,
                    totalWinnings:new string[](0)
            });
            allBiders.push(newBidder);
        }
    }

    function placeLaptopBid() external payable moneyExists(0.01 ether) trackOwner(msg.sender) checkStage(){
        laptop.addressesOfBiders.push(msg.sender);
        laptop.totalBids++;
        emit BidPlaced(msg.sender, "You did a succesfull Bid is a laptop!!");
        bool flag = false ; 
        for(uint i =0; i<allBiders.length;i++){
            if(keccak256(abi.encodePacked(msg.sender)) == keccak256(abi.encodePacked(allBiders[i].bidderAddress))){
                flag = true;
                allBiders[i].bids[2] =  allBiders[i].bids[2] + 1 ;
            }
        }
        if(flag == false){
            Bidder memory newBidder = Bidder({
                    bidderAddress: msg.sender,
                    bids: [0,0,1] ,
                    totalWinnings:new string[](0)
            });
            allBiders.push(newBidder);
        }
    }

    function amIAWinner() external returns (string memory){
        if(stage != Stage.afterDraw){
            emit InvalidStage("This Button can clicked only after draw!");
            return "This Button can clicked only after draw!";
        }
        for(uint i=0; i<allBiders.length; i++){
            if(keccak256(abi.encodePacked(msg.sender)) == keccak256(abi.encodePacked(allBiders[i].bidderAddress))){
                if(allBiders[i].totalWinnings.length == 3){
                    return "Congratulations! you won a car, a phone and a laptop";
                }else if(allBiders[i].totalWinnings.length == 2){
                    string memory message = string(abi.encodePacked("Congratulations! you won a ",allBiders[i].totalWinnings[0]," and a ",allBiders[i].totalWinnings[1]));
                    return message;
                }else if(allBiders[i].totalWinnings.length == 1){
                    string memory message = string(abi.encodePacked("Congratulations! you won a ",allBiders[i].totalWinnings[0]));
                    return message;
                }else{
                    return "Unfortunately you didn't win anything";
                }
            }
        }
        return "you did not a bid" ; 
    }

    function random() private view returns (uint) {
        return uint(block.timestamp);
    }

    function declareWinner() external onlyOwner  {
        if(stage != Stage.preDraw){
            emit InvalidStage("already did a draw");
            return;
        }
        stage = Stage.afterDraw;
        uint indexCar;
        uint indexPhone;
        uint indexLaptop;
        if(car.addressesOfBiders.length > 0 ){
            indexCar = random() % car.addressesOfBiders.length;
            emit DebugMessage(indexCar,"random number for car");
            emit DebugMessage(allBiders.length,"allBiders.length number");
            for(uint i=0;i<allBiders.length;i++){
                if(allBiders[i].bidderAddress == car.addressesOfBiders[indexCar]){
                    allBiders[i].totalWinnings.push(car.name);
                    car.winner = car.addressesOfBiders[indexCar];
                    emit carWinner(car.winner);

                }
            }
        }
        if(phone.addressesOfBiders.length > 0 ){
            indexPhone = random() % phone.addressesOfBiders.length;
            emit DebugMessage(indexPhone,"random number for phone");
            for(uint i=0;i<allBiders.length;i++){
                if(allBiders[i].bidderAddress == phone.addressesOfBiders[indexPhone]){
                    allBiders[i].totalWinnings.push(phone.name);
                    phone.winner = allBiders[i].bidderAddress;
                    emit phoneWinner(phone.winner);
                }
            }
        }
        if(laptop.addressesOfBiders.length > 0){
            indexLaptop = random() % laptop.addressesOfBiders.length;
            emit DebugMessage(indexLaptop,"random number for laptop");
            for(uint i=0;i<allBiders.length;i++){
                if(allBiders[i].bidderAddress == laptop.addressesOfBiders[indexLaptop]){
                    allBiders[i].totalWinnings.push(laptop.name);
                    laptop.winner = allBiders[i].bidderAddress;
                    emit laptopWinner(laptop.winner);
                }
            }
        }
    }

    function withdraw() public onlyOwner { 
        payable(msg.sender).transfer(address(this).balance);
    }

    function reset() external onlyOwner {
        withdraw();

        delete allBiders;
        stage = Stage.preDraw;

        delete car.addressesOfBiders;
        car.totalBids = 0;
        car.winner = address(0);

        delete phone.addressesOfBiders;
        phone.totalBids = 0;
        phone.winner = address(0);

        delete laptop.addressesOfBiders;
        laptop.totalBids = 0;
        laptop.winner = address(0);
    }

    function setNewOwner(address _newOwner) external onlyOwner {
        owner = _newOwner;
    }

    function destroy() external onlyOwner {
        emit ContractDestroyed(msg.sender);
        selfdestruct(payable(owner));
    }
    function getCarTotalBids() public view returns (uint) {
        return car.totalBids;
    }
    function getPhoneTotalBids() public view returns (uint) {
        return phone.totalBids;
    }
    function getLaptopTotalBids() public view returns (uint) {
        return laptop.totalBids;
    }


}