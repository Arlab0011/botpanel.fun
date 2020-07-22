import React from 'react';
import PropTypes, { func } from 'prop-types';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Button';

import '../css/coin.css'

import { RichCell, Avatar, Button, Div, List, Cell, Header, Text, SimpleCell } from '@vkontakte/vkui'

const MODAL_PAGE_COINGAME = 'coinGame'

const CoinGame = ({game, state, setActiveModal}) => (
    <SimpleCell
        onClick={() => {
            state.selectedCoinGame = game
            setActiveModal(MODAL_PAGE_COINGAME)
        }}
        before={<Div><Avatar size={56} src={game.player1.side + ".gif"}><Avatar size={48} src={game.player1.avatar}/></Avatar></Div>}
        after={game.player2 ? 
            <Div><Avatar size={56} src={game.player2.side + '.gif'}><Avatar size={48} src={game.player2.avatar}/></Avatar></Div>
            : 
            <Div><Avatar size={56} src='player.png'></Avatar></Div>
        }
        size="l"
        multiline
        description={!game.winner && "VS"}
        style={{textAlign: "center"}}
        >

        {(game.winner == 1 ?
            <Div alignX="center" style={{display: 'flex', justifyContent: 'space-between'}}>
                <div style={{alignItems: 'center'}}>
                    <div class="ng-star-inserted" style={{flexDirection: 'row', boxSizing: 'border-box', }}>
                        <div class={"coin-flip-ctn " + game.player1.side} fxflex="100" style={{flex: 1, boxSizing: "content-box", maxWidth: 100}}>
                            <div class="front"></div>
                            <div class="back"></div>
                        </div>
                    </div>
                </div>
            </Div>
            : 
            <div></div>
        )}
        {(game.winner == 2 ?
            <Div alignX="center" style={{display: 'flex', justifyContent: 'space-between'}}>
                <div style={{alignItems: 'center'}}>
                    <div class="ng-star-inserted" style={{flexDirection: 'row', boxSizing: 'border-box', }}>
                        <div class={"coin-flip-ctn " + game.player2.side} fxflex="100" style={{flex: 1, boxSizing: "content-box", maxWidth: 100}}>
                            <div class="front"></div>
                            <div class="back"></div>
                        </div>
                    </div>
                </div>
            </Div>
            : 
            <div></div>
        )}
        {(game.winner == undefined ?
            <Text weight="semibold" style={{color: "black"}}>{game.value} coins</Text>
            : 
            <div></div>
        )}
    </SimpleCell>
);

export default CoinGame;