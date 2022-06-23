from pathlib import Path

from AoE2ScenarioParser.scenarios.aoe2_de_scenario import AoE2DEScenario

scenario_folder = "C:\\Users\\<USERNAME>\\Games\\Age of Empires 2 DE\\<STEAM_ID>\\resources\\_common\\scenario\\"
scenario_file = "start"  # Don't include the '.aoe2scenario' extension
scenario_output_file = "OUTPUT"

xs_path = Path(__file__).parent / 'client-test.xs'
file_path = Path(scenario_folder) / (scenario_file + '.aoe2scenario')
output_file_path = Path(scenario_folder) / (scenario_output_file + '.aoe2scenario')

filename = "empty2p"
scenario = AoE2DEScenario.from_file(str(file_path.resolve()))
scenario.xs_manager.add_script(str(xs_path.resolve()))
scenario.write_to_file(str(output_file_path.resolve()))
