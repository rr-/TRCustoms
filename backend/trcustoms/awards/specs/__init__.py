from .amulet_of_horus import amulet_of_horus
from .base import AwardSpec
from .bestiary import bestiary
from .bone_dust import bone_dust
from .chirugai import chirugai
from .demons_heart import demons_heart, spear_of_destiny
from .dragon_statue import dragon_statue
from .dual_pistols import dual_pistols
from .gate_key import gate_key
from .iris import iris
from .magic_stones import magic_stones
from .nightmare_stone import nightmare_stone
from .obscura_paintings import obscura_paintings
from .philosophers_stone import philosophers_stone
from .playlist_artefacts import playlist_artefacts
from .sanglyph import sanglyph
from .scion import scion
from .seraph import seraph
from .smugglers_key import smugglers_key
from .werners_broken_glasses import werners_broken_glasses
from .werners_notebook import werners_notebook

ALL_AWARD_SPECS = [
    *dragon_statue(),
    *amulet_of_horus(),
    *scion(),
    *dual_pistols(),
    *philosophers_stone(),
    *iris(),
    *bestiary(),
    *seraph(),
    *werners_broken_glasses(),
    *bone_dust(),
    *sanglyph(),
    *gate_key(),
    *smugglers_key(),
    *werners_notebook(),
    *nightmare_stone(),
    *magic_stones(),
    *playlist_artefacts(),
    *demons_heart(),
    *spear_of_destiny(),
    *chirugai(),
    *obscura_paintings(),
]


__all__ = [
    "AwardSpec",
    "amulet_of_horus",
    "bestiary",
    "bone_dust",
    "chirugai",
    "demons_heart",
    "dragon_statue",
    "dual_pistols",
    "gate_key",
    "iris",
    "magic_stones",
    "nightmare_stone",
    "philosophers_stone",
    "sanglyph",
    "scion",
    "seraph",
    "smugglers_key",
    "spear_of_destiny",
    "werners_broken_glasses",
    "werners_notebook",
    "obscura_paintings",
]
