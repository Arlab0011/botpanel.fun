import 'core-js/es/map';
import 'core-js/es/set';
import React from 'react';
import PropTypes from 'prop-types';
import { platform, IOS, CellButton } from '@vkontakte/vkui';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import PanelHeaderButton from '@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';

import CardGrid from '@vkontakte/vkui/dist/components/CardGrid/CardGrid'
import Card from '@vkontakte/vkui/dist/components/Card/Card'
import Group from '@vkontakte/vkui/dist/components/Group/Group';
import { RichCell, Avatar, Button, Div, List, Cell, Header, Text } from '@vkontakte/vkui'
import SimpleCell from '@vkontakte/vkui/dist/components/SimpleCell/SimpleCell'

import '../css/coin.css'


import CoinGame from '../components/coingame'

const osName = platform();

const MODAL_PAGE_COINCREATE = 'coinCreate'

const Coin = ({ id, go, state, setActiveModal, coinGames }) => (
	<Panel id={id}>
		<PanelHeader
			left={<PanelHeaderButton onClick={go} data-to="home">
				{osName === IOS ? <Icon28ChevronBack/> : <Icon24Back/>}
			</PanelHeaderButton>}
		>
			Монетка
		</PanelHeader>
        <Group>
            <Div>
                <Button size="xl" onClick={() => setActiveModal(MODAL_PAGE_COINCREATE)}>Создать игру</Button>
            </Div>
            <Group header={<Header mode="secondary">Ваши игры</Header>}>
                <List>
                    {coinGames.map((game) =>{
                        if(game.player1.id == state.id) {
                            return <CoinGame game={game} state={state} setActiveModal={setActiveModal} />
                        }
                    })}
                </List>
            </Group>
            <Group header={<Header mode="secondary">Текущие игры</Header>}>
                <List>
                    {coinGames.map((game) =>{
                        if(game.player1.id != state.id) {
                            return <CoinGame game={game} state={state} setActiveModal={setActiveModal} />
                        }
                    })}
                </List>
            </Group>
        </Group>
	</Panel>
);

export default Coin;
