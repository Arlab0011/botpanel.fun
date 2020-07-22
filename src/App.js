import 'core-js/es/map';
import 'core-js/es/set';
import React, { useState, useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import '@vkontakte/vkui/dist/vkui.css';

import Home from './panels/Home';
import Knb from './panels/Knb';
import Coin from './panels/Coin';
import Roulette from './panels/Roulette';

import ModalRoot from '@vkontakte/vkui/dist/components/ModalRoot/ModalRoot'
import ModalPage from '@vkontakte/vkui/dist/components/ModalPage/ModalPage'
import ModalPageHeader from '@vkontakte/vkui/dist/components/ModalPageHeader/ModalPageHeader'
import PanelHeaderButton from '@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton'
import FormLayout from '@vkontakte/vkui/dist/components/FormLayout/FormLayout'
import Cell from '@vkontakte/vkui/dist/components/Cell/Cell';
import InfoRow from '@vkontakte/vkui/dist/components/InfoRow/InfoRow';
import List from '@vkontakte/vkui/dist/components/List/List'
import FormLayoutGroup from '@vkontakte/vkui/dist/components/FormLayoutGroup/FormLayoutGroup'
import Input from '@vkontakte/vkui/dist/components/Input/Input'
import Button from '@vkontakte/vkui/dist/components/Button/Button'
import Div from '@vkontakte/vkui/dist/components/Div/Div';
import Link from '@vkontakte/vkui/dist/components/Link/Link';
import { Select } from '@vkontakte/vkui';
import { Snackbar, Avatar} from '@vkontakte/vkui';
import Text from '@vkontakte/vkui/dist/components/Typography/Text/Text'
import Caption from '@vkontakte/vkui/dist/components/Typography/Caption/Caption';
import Icon16Done from '@vkontakte/icons/dist/16/done';
import { Card, CardGrid, Title, SimpleCell } from '@vkontakte/vkui'

import { transitions, positions, Provider as AlertProvider } from 'react-alert'
import AlertTemplate from 'react-alert-template-basic'
import { useAlert } from 'react-alert'

import socketIOClient from "socket.io-client";

const blueBackground = {
	backgroundColor: 'var(--accent)'
};

const path = require('path');
const fs = require('fs');
const axios = require('axios');
const ENDPOINT = "https://botpanel.fun:4001";

const MODAL_PAGE_DEPOSIT = 'deposit';
const MODAL_PAGE_WITHDRAW = 'withdraw'
const MODAL_PAGE_COINCREATE = 'coinCreate'
const MODAL_PAGE_COINGAME = 'coinGame'

class App extends React.Component {
		
	constructor(props) {
		super(props);
		this.state = {
			activePanel: 'home',
			fetchedUser: null,
			popout: 0,
			balance: 0,
			test_balance: 0,
			activeModal: null,
			modalHistory: [],
			depositValue: 49,
			snackbar: null,
			socket: null,
			coinValue: 50,
			coinSide: null,
			withdrawType: null,
			withdrawWallet: null,
			withdrawValue: 50,
			test: false,

			coinGames: []
		};

		this.modalBack = () => {
			this.setActiveModal(this.state.modalHistory[this.state.modalHistory.length - 2]);
		};

		this.changeBet = this.changeBet.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.onChange = this.onChange.bind(this);
		this.openBase = this.openBase.bind(this);
	}


	componentDidMount = () => { 
		this.openBase()
		let currentComponent = this;

		bridge.subscribe((e) => {
			switch (e.detail.type) {
				case 'VKWebAppGetUserInfoResult':
					this.setState({ fetchedUser: e.detail.data });
				break;
				default:
					console.log(e.detail.type);
			}
		});
		// async function fetchUser() {
		const user = bridge.send('VKWebAppGetUserInfo')
		.then(vk => {
			axios.get(`${ENDPOINT}/api/user/${vk.id}`)
			.then(function(res) {
				if(res.data != null) {
					currentComponent.setState({id: res.data.id, avatar: res.data.avatar, balance: res.data.balance, test_balance: res.data.test_balance});
					socket.emit('updateUser', res.data.id)
				} else {
					axios.post(`${ENDPOINT}/api/user`, {
						id: vk.id,
						first_name: vk.first_name,
						last_name: vk.last_name,
						avatar: vk.photo_200
					})
					.then(function (user) {
						currentComponent.setState({id: user.data.id, avatar: user.data.avatar, balance: user.data.balance, test_balance: user.data.test_balance});
						socket.emit('updateUser', user.data.id)
					})
				}
			})
		})

        // let ca = fs.readFileSync(path.resolve(__dirname+ '/openssl/server.ca')).toString()

		const socket = socketIOClient("https://botpanel.fun:4001/");

		this.setState({socket: socket})

		socket.on("updatedUser", (data) => {
			currentComponent.setState({balance: data.balance, test_balance: data.test_balance, history: data.history, id: data.id, avatar: data.avatar, usedPromo: data.usedPromo})
			socket.emit('updateUser', data.id)
		});

// 		socket.emit('subscribe', 'coin');

		socket.on('coinGames', function (coinGames) {
			currentComponent.setState({coinGames: coinGames})
		})

		socket.on('coinCreated', function (games) {
			currentComponent.setState({coinGames: games})
			currentComponent.setActiveModal(null)
		})

		socket.on('coinJoined', function (games) {
			currentComponent.setState({coinGames: games})
			currentComponent.setActiveModal(null)
		})
	}

	compare = (A, B) => {
		// Use toUpperCase() to ignore character casing
		const a = a.value;
		const b = b.value;
	  
		let comparison = 0;
		if (a > b) {
		  comparison = 1;
		} else if (a < b) {
		  comparison = -1;
		}
		return comparison;
	  }

	go = e => {
		let socket =  this.state.socket
		switch(e.currentTarget.dataset.to) {
			case 'coin':
				if(!this.state.test) {
					socket.emit('subscribe', 'coin');
					socket.on('coinJoined', function () {
					})
				} else {
					socket.emit('subscribe', 'coinTest');
					socket.on('coinJoined', function () {
					})
				}
			break;

			case 'roulette':
				socket.emit('subscribe', 'roulette');
				socket.on('rouletteJoined', function () {
				})
			break;

			case 'knb':
				socket.emit('subscribe', 'knb');
				socket.on('knbJoined', function () {
				})
			break;

			case 'home':
				if(!this.state.test) socket.emit('unsubscribe', this.state.activePanel) 
				else socket.emit('unsubscribe', this.state.activePanel + "Test") 
			break;
		}
		this.setState({ activePanel: e.currentTarget.dataset.to })
	};

	onChange(e) {
		const { name, value } = e.currentTarget;
		this.setState({ [name]: value });
	}

	modalBack = () => {
		this.setActiveModal(this.state.modalHistory[this.state.modalHistory.length - 2]);
	};

	changeTest = () => {
		if(this.state.test) this.setState({test: false})
		else this.setState({test: true})
	}

	getPromo = () => {
		bridge.send("VKWebAppJoinGroup", {"group_id": 197279670})
		.then((res) => {
		    if(res.result == true) {
	           this.state.socket.emit('getPromo', this.state.id)
		    }
		})
	}

	setActiveModal = (activeModal) => {
		activeModal = activeModal || null;
		let modalHistory = this.state.modalHistory ? [...this.state.modalHistory] : [];
	
		if (activeModal === null) {
		  modalHistory = [];
		} else if (modalHistory.indexOf(activeModal) !== -1) {
		  modalHistory = modalHistory.splice(0, modalHistory.indexOf(activeModal) + 1);
		} else {
		  modalHistory.push(activeModal);
		}
	
		this.setState({
		  activeModal,
		  modalHistory
		});
	};

	openBase () {
		if (this.state.snackbar) return;
		this.setState({ snackbar:
		  <Snackbar
			layout="vertical"
			onClose={() => this.setState({ snackbar: null })}
			before={<Avatar size={24} style={blueBackground}><Icon16Done fill="#fff" width={14} height={14} /></Avatar>}
		  >
			Уведомления о подкастах включены
		  </Snackbar>
		});
	}

	changeBet(event) {
		switch(event.target.innerHTML) {
			case '+100':
				this.setState({coinValue: parseInt(this.state.coinValue + 100)})
			break;
			case '+1000':
				this.setState({coinValue: parseInt(this.state.coinValue + 1000)})
			break;
			case '/2':
				this.setState({coinValue: parseInt(this.state.coinValue / 2)})
			break;
			case 'x2':
				this.setState({coinValue: parseInt(this.state.coinValue * 2)})
			break;
		}
	}

	handleChange(event) {
		if(event.target.name == "depositValue") {
			if(parseInt(event.target.value) < 50) {
				event.target.value = 50
				this.setState({depositValue: parseInt(event.target.value)});
			} else if(parseInt(event.target.value) > 15000) {
				event.target.value = 15000
				this.setState({depositValue: parseInt(event.target.value)});
			} else {
				this.setState({depositValue: parseInt(event.target.value)});
			}
		} else if(event.target.name == "withdrawValue") {
			if(parseInt(event.target.value) < 50) {
				event.target.value = 50
				this.setState({withdrawValue: parseInt(event.target.value)});
			} else if(parseInt(event.target.value) > this.state.balance) {
				event.target.value = this.state.balance
				this.setState({withdrawValue: parseInt(this.state.balance)});
			} else {
				this.setState({withdrawValue: parseInt(event.target.value)});
			}
		} else if(event.target.name == "coinValue") {
		    if(!this.state.test) {
    			if(parseInt(event.target.value) <= 1) {
    				event.target.value = 1
    				this.setState({coinValue: parseInt(event.target.value)});
    			} else if(parseInt(event.target.value) > this.state.balance) {
    		        event.target.value = this.state.balance
    		        this.setState({coinValue: parseInt(this.state.balance)});
    			} else {
    				this.setState({coinValue: parseInt(event.target.value)});
    			}
		    } else {
		        if(parseInt(event.target.value) <= 1) {
    				event.target.value = 1
    				this.setState({coinValue: parseInt(event.target.value)});
    			} else if(parseInt(event.target.value) > this.state.test_balance) {
    		        event.target.value = this.state.test_balance
    		        this.setState({coinValue: parseInt(this.state.test_balance)});
    			} else {
    				this.setState({coinValue: parseInt(event.target.value)});
    			}
		    }
		}
	}

	handleSubmit(event) {
		event.preventDefault();
		let currentComponent = this;
		switch(event.currentTarget.name) {
			case 'withdraw':
				axios.post(`${ENDPOINT}/api/withdraw`, {
					id: this.state.id,
					value: event.target[0].value,
					type: event.target[1].value,
					wallet: event.target[2].value,
				})
				.then(function (withdraw) {
					currentComponent.setActiveModal(null)
				})
				
			break;
			case 'createCoin':
				if(currentComponent.state.test == false) {
					currentComponent.state.socket.emit('coinCreate', {
						id: this.state.id,
						test: this.state.test,
						value: event.target[0].value,
						player1: {
							id: this.state.id,
							side: event.target[1].value,
							avatar: this.state.avatar
						}
					})
				} else {
					currentComponent.state.socket.emit('coinTestCreate', {
						id: this.state.id,
						test: this.state.test,
						value: event.target[0].value,
						player1: {
							id: this.state.id,
							side: event.target[1].value,
							avatar: this.state.avatar
						}
					})
				}
			break;
			case 'coinJoin':
				currentComponent.state.socket.emit('coinJoin', {id: this.state.selectedCoinGame.id, user: this.state.id})
			break;
		}
	}

	render() {
		const modal = (
			<ModalRoot
			  activeModal={this.state.activeModal}
			  onClose={this.modalBack}
			>
			  	<ModalPage
				  id={MODAL_PAGE_DEPOSIT}
				  header={
					<ModalPageHeader
					//   left={IS_PLATFORM_ANDROID && <PanelHeaderButton onClick={this.modalBack}><Icon24Cancel /></PanelHeaderButton>}
					//   right={IS_PLATFORM_IOS && <PanelHeaderButton onClick={this.modalBack}><Icon24Dismiss /></PanelHeaderButton>}
					>
					  Пополнение
					</ModalPageHeader>
				  }
				>
					<FormLayout onSubmit={this.handleSubmit}>
						<FormLayoutGroup top="Сумма в рублях">
							<Input 
								type="number" 
								name="depositValue"
								defaultValue="49"
								placeholder="От 49 до 15000" 
								onChange={this.handleChange}
								min="50" 
								max="15000"
							/>
							<Button size="xl" href={"https://qiwi.com/payment/form/99?extra[%27account%27]=7911721334&amountInteger=" + this.state.depositValue + "&amountFraction=0&extra[%27comment%27]=" + this.state.id + "&currency=RUB&blocked[0]=account&blocked[1]=sum&blocked[2]=comment"}>Пополнить на {this.state.depositValue} рублей</Button>
						</FormLayoutGroup>
					</FormLayout>
				</ModalPage>

				<ModalPage
				  id={MODAL_PAGE_WITHDRAW}
				  header={
					<ModalPageHeader
					//   left={IS_PLATFORM_ANDROID && <PanelHeaderButton onClick={this.modalBack}><Icon24Cancel /></PanelHeaderButton>}
					//   right={IS_PLATFORM_IOS && <PanelHeaderButton onClick={this.modalBack}><Icon24Dismiss /></PanelHeaderButton>}
					>
					  Вывод
					</ModalPageHeader>
				  }
				>
					<Div>
						<Caption level="1" weight="heavy" caps>Доступно для вывода {this.state.balance} рублей</Caption>
					</Div>
				  	<FormLayout onSubmit={this.handleSubmit} name="withdraw">
						<FormLayoutGroup top="Сумма вывода">
							<Input 
								type="number" 
								name="withdrawValue"
								onChange={this.handleChange}
								defaultValue="50"
								value={this.state.withdrawValue}
								status={this.state.withdrawValue ? 'valid' : 'error'}
								min="50" 
								max={this.state.balance}
							/>
							<Select placeholder="Выберите плат. систему" name="withdrawType" onChange={this.onChange} value={this.state.withdrawType} status={this.state.withdrawType ? 'valid' : 'error'}>
								<option value="qiwi">QIWI</option>
							</Select>
						</FormLayoutGroup>
						<FormLayoutGroup top="Данные кошелька">
							<Input 
								type="text"
								value={this.state.withdrawWallet}
								status={this.state.withdrawWallet ? 'valid' : 'error'}
								onChange={this.onChange} 
								name="withdrawWallet"
							/>

							<Button size="xl">Вывести средства</Button>
						</FormLayoutGroup>
					</FormLayout>
				</ModalPage>

				<ModalPage
				  id={MODAL_PAGE_COINCREATE}
				  header={
					<ModalPageHeader
					//   left={IS_PLATFORM_ANDROID && <PanelHeaderButton onClick={this.modalBack}><Icon24Cancel /></PanelHeaderButton>}
					//   right={IS_PLATFORM_IOS && <PanelHeaderButton onClick={this.modalBack}><Icon24Dismiss /></PanelHeaderButton>}
					>
					  Создать игру
					</ModalPageHeader>
				  }
				>
				  	<FormLayout onSubmit={this.handleSubmit} name="createCoin">
						<FormLayoutGroup>
							<Input 
								type="number" 
								name="coinValue"
								onChange={this.handleChange}
								defaultValue="100"
								value={this.state.coinValue}
								min="50" 
								max={!this.state.test ? this.state.balance : this.state.test_balance}
							/>
							<Select placeholder="Выберите сторону" value={this.state.coinSide} name="coinSide" onChange={this.onChange} status={this.state.coinSide ? 'valid' : 'error'}>
								<option value="red">Красный</option>
								<option value="blue">Синий</option>
							</Select>
							{/* <Div style={{display: 'flex'}}>
								<Button type="button" size="m" stretched ><Text onClick={this.changeBet}>+100</Text></Button>
								<Button type="button" size="m" stretched ><Text onClick={this.changeBet}>+1000</Text></Button>
								<Button type="button" size="m" stretched ><Text onClick={this.changeBet}>/2</Text></Button>
								<Button type="button" size="m" stretched ><Text onClick={this.changeBet}>x2</Text></Button>
							</Div> */}
							<Button size="xl">Создать игру</Button>
						</FormLayoutGroup>
					</FormLayout>
				</ModalPage>
				
				<ModalPage
				  id={MODAL_PAGE_COINGAME}
				  header={
					<ModalPageHeader
					//   left={IS_PLATFORM_ANDROID && <PanelHeaderButton onClick={this.modalBack}><Icon24Cancel /></PanelHeaderButton>}
					//   right={IS_PLATFORM_IOS && <PanelHeaderButton onClick={this.modalBack}><Icon24Dismiss /></PanelHeaderButton>}
					>
					  Игра #{ this.state.selectedCoinGame && this.state.selectedCoinGame.id}
					</ModalPageHeader>
				  }
				>
				  	<FormLayout onSubmit={this.handleSubmit} name="coinJoin" data={this.state.selectedCoinGame && this.state.selectedCoinGame.id}>
						<FormLayoutGroup>
							{ this.state.selectedCoinGame &&
								<SimpleCell
									before={this.state.selectedCoinGame.player1 && <Div><Avatar size={100} src={this.state.selectedCoinGame.player1.side + ".gif"}><Avatar size={90} src={this.state.selectedCoinGame.player1.avatar}/></Avatar></Div>}
									after={this.state.selectedCoinGame.player2 ? 
										<Div><Avatar size={100} src={this.state.selectedCoinGame.player2.side + ".gif"}><Avatar size={90} src={this.state.selectedCoinGame.player2.avatar}/></Avatar></Div>
										: 
										<Div><Avatar size={100} src='player.png'></Avatar></Div>
									}
									size="l"
									multiline
									description={!this.state.selectedCoinGame.winner && "VS"}
									style={{textAlign: "center", paddingTop: 0, alignItems: "center"}}
								//   asideContent={<Icon24MoreHorizontal />}
									// bottomContent={
									//     <div style={{ textAlign: "center"}}>
									//         <Button size="m">Присоедениться</Button>
									//     {/* <Button size="m" mode="secondary" style={{ marginLeft: 8 }}>Скрыть</Button> */}
									//     </div>
									// }
								>
									{(this.state.selectedCoinGame.winner == 1 ?
										<Div style={{display: 'flex', justifyContent: 'space-between', alignSelf: "end"}}>
											<div style={{alignItems: 'center'}}>
												<div class="ng-star-inserted" style={{flexDirection: 'row', boxSizing: 'border-box', }}>
													<div class={"coin-flip-ctn " + this.state.selectedCoinGame.player1.side} fxflex="100" style={{flex: 1, boxSizing: "content-box", maxWidth: 100}}>
														<div class="front"></div>
														<div class="back"></div>
													</div>
												</div>
											</div>
										</Div>
										: 
										<div></div>
									)}
									{(this.state.selectedCoinGame.winner == 2 ?
										<Div style={{display: 'flex', justifyContent: 'space-between', alignSelf: "end"}}>
											<div style={{alignItems: 'center'}}>
												<div class="ng-star-inserted" style={{flexDirection: 'row', boxSizing: 'border-box', }}>
													<div class={"coin-flip-ctn " + this.state.selectedCoinGame.player1.side} fxflex="100" style={{flex: 1, boxSizing: "content-box", maxWidth: 100}}>
														<div class="front"></div>
														<div class="back"></div>
													</div>
												</div>
											</div>
										</Div>
										: 
										<div></div>
									)}
									{(this.state.selectedCoinGame.winner == undefined ?
										<Title level="2" weight="bold">{this.state.selectedCoinGame.value} coins</Title>
										: 
										<div></div>
									)}
								</SimpleCell>
							}
							{this.state.selectedCoinGame && this.state.selectedCoinGame.player1.id == this.state.id ?
								<div></div>
								:
								<Button size="xl">Присоедениться</Button>
								
							}
						</FormLayoutGroup>
					</FormLayout>
				</ModalPage>
				
			</ModalRoot>
		);
		

		return (
			<View activePanel={this.state.activePanel} popout={this.state.popout} modal={modal}>
				<Home id='home' state={this.state} go={this.go} setActiveModal={this.setActiveModal} usedPromo={this.state.usedPromo} getPromo={this.getPromo} changeTest={this.changeTest} />
				<Knb id="knb" state={this.state} go={this.go} setActiveModal={this.setActiveModal} />
				<Coin id="coin" state={this.state} go={this.go} setActiveModal={this.setActiveModal} changeTest={this.changeTest} coinGames={this.state.coinGames}/>
				<Roulette id="roulette" state={this.state} go={this.go} setActiveModal={this.setActiveModal} rouletteGame={this.state.rouletteGame}/>
			</View>
		);
	}
}

export default App;

