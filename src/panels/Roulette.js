import React from 'react';
import PropTypes from 'prop-types';
import { platform, IOS, Div } from '@vkontakte/vkui';
import Panel from '@vkontakte/vkui/dist/components/Panel/Panel';
import PanelHeader from '@vkontakte/vkui/dist/components/PanelHeader/PanelHeader';
import PanelHeaderButton from '@vkontakte/vkui/dist/components/PanelHeaderButton/PanelHeaderButton';
import Icon28ChevronBack from '@vkontakte/icons/dist/28/chevron_back';
import Icon24Back from '@vkontakte/icons/dist/24/back';
import { Doughnut } from 'react-chartjs-2';

const osName = platform();

const Roulette = ({ id, go, state, setActiveModal, rouletteGame }) => (
	<Panel id={id}>
		<PanelHeader
			left={<PanelHeaderButton onClick={go} data-to="home">
				{osName === IOS ? <Icon28ChevronBack/> : <Icon24Back/>}
			</PanelHeaderButton>}
		>
			Рулетка
		</PanelHeader>
        <Div>
            <Doughnut 
                data={{datasets: [
                    {data: 
                        [state.balance, state.test_balance],
                        backgroundColor: ['#3454d1','#d1345b'],
                        hoverBackgroundColor: ['#3454d1','#d1345b'],
                    }],
                    hover: false
                }}
                width={300}
                height={300} 
                legend={{display: false}}
            >123</Doughnut>
        </Div>
	</Panel>
);

export default Roulette;
