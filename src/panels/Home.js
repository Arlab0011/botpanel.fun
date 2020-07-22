import React from 'react';
import PropTypes from 'prop-types';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import Button from '@vkontakte/vkui/dist/components/Button/Button';
import Group from '@vkontakte/vkui/dist/components/Group/Group';
import Cell from '@vkontakte/vkui/dist/components/Cell/Cell';
import Div from '@vkontakte/vkui/dist/components/Div/Div';
import Avatar from '@vkontakte/vkui/dist/components/Avatar/Avatar';
import InfoRow from '@vkontakte/vkui/dist/components/InfoRow/InfoRow';
import Title from '@vkontakte/vkui/dist/components/Typography/Title/Title'
import Text from '@vkontakte/vkui/dist/components/Typography/Text/Text'
import Caption from '@vkontakte/vkui/dist/components/Typography/Caption/Caption'
import Headline from '@vkontakte/vkui/dist/components/Typography/Headline/Headline'
import Subhead from '@vkontakte/vkui/dist/components/Typography/Subhead/Subhead'

import ModalRoot from '@vkontakte/vkui/dist/components/ModalRoot/ModalRoot'
import ModalPage from '@vkontakte/vkui/dist/components/ModalPage/ModalPage'
import ModalPageHeader from '@vkontakte/vkui/dist/components/ModalPageHeader/ModalPageHeader'
import PanelHeaderButton from '@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton'
import FormLayout from '@vkontakte/vkui/dist/components/FormLayout/FormLayout'


import CardGrid from '@vkontakte/vkui/dist/components/CardGrid/CardGrid'
import Card from '@vkontakte/vkui/dist/components/Card/Card'
import SimpleCell from '@vkontakte/vkui/dist/components/SimpleCell/SimpleCell'
import CellButton from '@vkontakte/vkui/dist/components/CellButton/CellButton'
import List from '@vkontakte/vkui/dist/components/List/List'

import Icon28MoneyRequestOutline from '@vkontakte/icons/dist/28/money_request_outline';
import Icon28MoneySendOutline from '@vkontakte/icons/dist/28/money_send_outline';
import Icon36GameOutline from '@vkontakte/icons/dist/36/game_outline';
import Icon28TargetOutline from '@vkontakte/icons/dist/28/target_outline';
import Icon28CoinsOutline from '@vkontakte/icons/dist/28/coins_outline';
import Icon24Cancel from '@vkontakte/icons/dist/24/cancel';
import Icon24Dismiss from '@vkontakte/icons/dist/24/dismiss';
import Icon28RefreshOutline from '@vkontakte/icons/dist/28/refresh_outline';

import { usePlatform, ANDROID, IOS } from '@vkontakte/vkui'

const MODAL_PAGE_DEPOSIT = 'deposit';
const MODAL_PAGE_WITHDRAW = 'withdraw'

const Home = ({ id, go, state, getPromo, usedPromo, changeTest, setActiveModal }) => (
	<Panel id={id}>
		<PanelHeader>ВК игры</PanelHeader>
		{state &&
		<Group>
			<Div>
				<Caption level="1" weight="semibold" style={{ marginBottom: 0, textAlign: "center" }}>Ваш{state.test ? " тестовый " : " "}баланс</Caption>
				<Title level="1" weight="heavy" style={{ textAlign: "center" }}>{state.test ? state.test_balance + " coins" : state.balance + " coins"}</Title>
			</Div>
			<CardGrid>
				<Card size="m">
					<SimpleCell align="center" onClick={() => setActiveModal(MODAL_PAGE_DEPOSIT)}>
						{/* <CellButton mode="secondary" align="center"> */}
							<Icon28MoneyRequestOutline width={50} height={50} style={{ }}/>
							<Subhead weight="semibold">Пополнить</Subhead>
						{/* </CellButton> */}
					</SimpleCell>
				</Card>
				<Card size="m" style={{marginBottom: 16}}>
					<SimpleCell align="center" onClick={() => setActiveModal(MODAL_PAGE_WITHDRAW)}>
						{/* <CellButton mode="secondary" align="center"> */}
							<Icon28MoneySendOutline width={50} height={50} style={{  }}/>
							<Subhead weight="semibold" style={{ }}>Вывести</Subhead>
						{/* </CellButton> */}
					</SimpleCell>
				</Card>
				<Button size="xl" mode="secondary" onClick={() => changeTest()}>Перейти на {state.test ? 'реальный' : 'тестовый'} режим</Button>
			</CardGrid>
		</Group>}
		<Group>
			<CardGrid>
				<Card size="m" mode="shadow">
					<SimpleCell align="center" onClick={go} data-to="coin">
						<Icon28CoinsOutline width={50} height={50}/>
						<Subhead weight="semibold" style={{ }}>Монетка</Subhead>
					</SimpleCell>
				</Card>
				<Card size="m" mode="shadow" style={{marginBottom: 16}}>
					<SimpleCell align="center">
						<Icon28RefreshOutline width={50} height={50}/>
						<Subhead weight="semibold" style={{ }}>Скоро...{state.usedPromo}</Subhead>
					</SimpleCell>
				</Card>
			</CardGrid>
		</Group>
	</Panel>
);

export default Home;
